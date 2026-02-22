import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { sanitizeText } from '../_shared/sanitize.ts';

const VALID_CATEGORIES = [
  'code', 'fix', 'deploy', 'test', 'docs', 'refactor', 'review',
  'learn', 'ops', 'milestone', 'life', 'health', 'finance', 'social', 'creative',
];

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
    const { category, title, description, xp, tags, is_public, metadata, source_platform } = body;

    // Validate
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
    if (!xp || xp < 5 || xp > 500) {
      return new Response(JSON.stringify({ error: 'xp must be between 5 and 500' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        metadata: metadata || {},
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

    if (profile) {
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

      await supabase
        .from('profiles')
        .update({
          total_xp: profile.total_xp + xp,
          year_xp: profile.year_xp + xp,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_active_date: today,
          achievements_this_month: profile.achievements_this_month + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Update season participant if active season
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
        }).catch(() => {
          // RPC may not exist yet — ignore
        });
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
          payload: {
            achievement_id: achievement.id,
            category,
            title: sanitizedTitle,
            xp,
          },
        });
      }

      // Calculate age level
      const ageLevel = profile.birth_date
        ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null;

      return new Response(JSON.stringify({
        achievement,
        stats: {
          total_xp: profile.total_xp + xp,
          year_xp: profile.year_xp + xp,
          age_level: ageLevel,
          current_streak: newStreak,
          longest_streak: longestStreak,
        },
        rate_limit_remaining: rateCheck.remaining,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ achievement }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
