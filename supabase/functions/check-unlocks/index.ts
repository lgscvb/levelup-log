import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const user = await getAuthUser(authHeader);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabaseClient(authHeader);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp, year_xp, current_streak')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get already unlocked title IDs
    const { data: unlockedTitles } = await supabase
      .from('user_titles')
      .select('title_id')
      .eq('user_id', user.id);

    const unlockedIds = new Set((unlockedTitles || []).map(t => t.title_id));

    // Get all title definitions
    const { data: allTitles } = await supabase
      .from('title_definitions')
      .select('*')
      .order('rarity');

    // Get category counts
    const { data: achievements } = await supabase
      .from('achievements')
      .select('category')
      .eq('user_id', user.id);

    const categoryCounts: Record<string, number> = {};
    for (const a of achievements || []) {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    }

    // Check which titles can be unlocked
    const newlyUnlocked: typeof allTitles = [];
    const progress: Array<{ title: typeof allTitles[0]; current: number; required: number }> = [];

    for (const title of allTitles || []) {
      if (unlockedIds.has(title.id)) continue;

      const req = title.requirement_value as Record<string, unknown>;
      let met = false;
      let current = 0;
      let required = 0;

      switch (title.requirement_type) {
        case 'total_xp':
          required = (req.min_xp as number) || 0;
          current = profile.total_xp;
          met = current >= required;
          break;

        case 'year_xp':
          required = (req.min_xp as number) || 0;
          current = profile.year_xp;
          met = current >= required;
          break;

        case 'category_count':
          required = (req.count as number) || 0;
          current = categoryCounts[(req.category as string)] || 0;
          met = current >= required;
          break;

        case 'streak':
          required = (req.days as number) || 0;
          current = profile.current_streak;
          met = current >= required;
          break;

        case 'special':
          // Special titles need custom logic — skip for now
          break;
      }

      if (met) {
        newlyUnlocked.push(title);
        // Actually unlock it
        await supabase.from('user_titles').insert({
          user_id: user.id,
          title_id: title.id,
        });
      } else if (required > 0) {
        progress.push({ title, current, required });
      }
    }

    // Sort progress by closest to completion
    progress.sort((a, b) => (b.current / b.required) - (a.current / a.required));

    return new Response(JSON.stringify({
      newly_unlocked: newlyUnlocked,
      progress: progress.slice(0, 5), // Top 5 closest
      total_unlocked: unlockedIds.size + newlyUnlocked.length,
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
