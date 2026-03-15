import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { sanitizeText } from '../_shared/sanitize.ts';
import { checkAndUnlockTitles } from '../_shared/unlock-titles.ts';

// ─── XP Formula (server-authoritative) ───────────────────────────────────────
//
// XP is calculated here on the server — the client sends raw params only.
// This prevents clients from submitting arbitrary XP values.
//
// Formula:
//   base    = COMPLEXITY_BASE[complexity] × timeMultiplier(time_minutes)
//   bonuses = outputBonus(output_units) + inputBonus(input_units) + roundsBonus(rounds)
//   raw_xp  = clamp(round((base + bonuses) × category.xp_weight), 5, 500)
//   xp      = self_reported ? round(raw_xp × 0.85) : raw_xp
// ─────────────────────────────────────────────────────────────────────────────

type Complexity = 'trivial' | 'normal' | 'significant' | 'major' | 'milestone';

const COMPLEXITY_BASE: Record<Complexity, number> = {
  trivial: 10,
  normal: 30,
  significant: 75,
  major: 150,
  milestone: 300,
};

// xp_weight per category — keep in sync with packages/mcp-server/src/utils/config.ts
const CATEGORY_XP_WEIGHT: Record<string, number> = {
  code: 1.0, fix: 1.1, deploy: 1.3, test: 1.0, docs: 0.9,
  refactor: 1.0, review: 0.9, ops: 1.2, learn: 1.0, milestone: 1.5,
  life: 0.9, health: 1.1, finance: 1.0, social: 0.9, creative: 1.0,
  spiritual: 0.85, hobby: 0.8,
};

const VALID_CATEGORIES = Object.keys(CATEGORY_XP_WEIGHT);

function timeMultiplier(minutes: number): number {
  if (minutes < 15) return 0.7;
  if (minutes < 60) return 1.0;
  if (minutes < 180) return 1.3;
  return 1.6;
}

function outputBonus(units: number): number {
  if (units <= 0) return 0;
  return Math.min(Math.round(Math.log2(units + 1) * 12), 60);
}

function inputBonus(units: number): number {
  return Math.min(Math.max(units, 0), 15);
}

function roundsBonus(rounds: number): number {
  return Math.min(Math.max(rounds, 0), 25);
}

function calculateXp(params: {
  category: string;
  complexity: Complexity;
  time_minutes?: number;
  output_units?: number;
  input_units?: number;
  conversation_rounds?: number;
  self_reported?: boolean;
}): number {
  const catWeight = CATEGORY_XP_WEIGHT[params.category] ?? 1.0;
  const base =
    COMPLEXITY_BASE[params.complexity] *
    timeMultiplier(params.time_minutes ?? 30);
  const bonuses =
    outputBonus(params.output_units ?? 0) +
    inputBonus(params.input_units ?? 0) +
    roundsBonus(params.conversation_rounds ?? 0);
  const raw = Math.min(500, Math.max(5, Math.round((base + bonuses) * catWeight)));
  return params.self_reported ? Math.max(5, Math.round(raw * 0.85)) : raw;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get('authorization');
    const user = await getAuthUser(authHeader);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit
    const rateCheck = checkRateLimit(user.id);
    if (!rateCheck.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded (20/hour)' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse body
    const body = await req.json();
    const {
      category, title, description, tags, is_public,
      metadata, source_platform,
      complexity, time_minutes, output_units, input_units,
      conversation_rounds, self_reported,
    } = body;

    // Validate required fields
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return new Response(JSON.stringify({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!title || !description) {
      return new Response(JSON.stringify({ error: 'title and description are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!complexity || !COMPLEXITY_BASE[complexity as Complexity]) {
      return new Response(JSON.stringify({ error: 'complexity must be one of: trivial, normal, significant, major, milestone' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── XP calculated server-side ──────────────────────────────────────────
    const xp = calculateXp({
      category,
      complexity: complexity as Complexity,
      time_minutes,
      output_units,
      input_units,
      conversation_rounds,
      self_reported,
    });

    // Sanitize text fields
    const sanitizedTitle = sanitizeText(title);
    const sanitizedDesc = sanitizeText(description);

    const supabase = getSupabaseClient(authHeader);

    // Insert achievement
    const { data: achievement, error: insertError } = await supabase
      .from('achievements')
      .insert({
        user_id: user.id,
        category,
        title: sanitizedTitle,
        description: sanitizedDesc,
        xp,
        tags: tags || [],
        metadata: {
          ...(metadata || {}),
          complexity,
          ...(time_minutes        != null ? { time_minutes }        : {}),
          ...(output_units        != null ? { output_units }        : {}),
          ...(input_units         != null ? { input_units }         : {}),
          ...(conversation_rounds != null ? { conversation_rounds } : {}),
          ...(self_reported               ? { self_reported }       : {}),
        },
        source_platform: source_platform || null,
        is_public: is_public ?? true,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update profile: total_xp, year_xp, streak, last_active_date
    const today = new Date().toISOString().split('T')[0];
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp, year_xp, current_streak, longest_streak, last_active_date, birth_date, achievements_this_month')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ achievement, xp }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lastActive = profile.last_active_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = profile.current_streak;
    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else if (lastActive !== today) {
      newStreak = 1;
    }

    const longestStreak = Math.max(profile.longest_streak, newStreak);
    const newTotalXp = profile.total_xp + xp;
    const newYearXp = profile.year_xp + xp;

    await supabase
      .from('profiles')
      .update({
        total_xp: newTotalXp,
        year_xp: newYearXp,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
        achievements_this_month: profile.achievements_this_month + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Update season XP if active season
    const { data: activeSeason } = await supabase
      .from('seasons')
      .select('id')
      .eq('is_active', true)
      .single();

    if (activeSeason) {
      await supabase.rpc('upsert_season_xp', {
        p_season_id: activeSeason.id,
        p_user_id: user.id,
        p_xp: xp,
      }).catch(() => {});
    }

    // Insert activity feed event
    if (is_public !== false) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      await supabase.from('activity_feed').insert({
        user_id: user.id,
        event_type: 'achievement',
        display_name: profileData?.display_name || 'Anonymous',
        avatar_url: profileData?.avatar_url,
        payload: { achievement_id: achievement.id, category, title: sanitizedTitle, xp },
      });
    }

    // Auto-check title unlocks
    const { newly_unlocked } = await checkAndUnlockTitles(supabase, user.id, {
      total_xp: newTotalXp,
      year_xp: newYearXp,
      current_streak: newStreak,
    });

    // Calculate age level
    const ageLevel = profile.birth_date
      ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    return new Response(JSON.stringify({
      achievement,
      xp,
      stats: {
        total_xp: newTotalXp,
        year_xp: newYearXp,
        age_level: ageLevel,
        current_streak: newStreak,
        longest_streak: longestStreak,
      },
      newly_unlocked,
      rate_limit_remaining: rateCheck.remaining,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
