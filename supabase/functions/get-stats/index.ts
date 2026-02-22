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

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, active_title:title_definitions(*)')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Get category breakdown (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: categoryStats } = await supabase
      .from('achievements')
      .select('category, xp')
      .eq('user_id', user.id)
      .gte('recorded_at', startOfMonth.toISOString());

    const breakdown: Record<string, { count: number; xp: number }> = {};
    for (const a of categoryStats || []) {
      if (!breakdown[a.category]) breakdown[a.category] = { count: 0, xp: 0 };
      breakdown[a.category].count++;
      breakdown[a.category].xp += a.xp;
    }

    // Get total achievement count
    const { count: totalAchievements } = await supabase
      .from('achievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get title count
    const { count: titleCount } = await supabase
      .from('user_titles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Calculate age level
    const ageLevel = profile.birth_date
      ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    // Get season rank if active season
    let seasonRank = null;
    const { data: activeSeason } = await supabase
      .from('seasons')
      .select('id, name')
      .eq('is_active', true)
      .single();

    if (activeSeason) {
      const { data: participant } = await supabase
        .from('season_participants')
        .select('season_xp')
        .eq('season_id', activeSeason.id)
        .eq('user_id', user.id)
        .single();

      if (participant) {
        const { count: higherCount } = await supabase
          .from('season_participants')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', activeSeason.id)
          .gt('season_xp', participant.season_xp);

        seasonRank = {
          season_name: activeSeason.name,
          season_xp: participant.season_xp,
          rank: (higherCount || 0) + 1,
        };
      }
    }

    return new Response(JSON.stringify({
      age_level: ageLevel,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      total_xp: profile.total_xp,
      year_xp: profile.year_xp,
      current_streak: profile.current_streak,
      longest_streak: profile.longest_streak,
      active_title: profile.active_title,
      total_achievements: totalAchievements,
      titles_unlocked: titleCount,
      category_breakdown: breakdown,
      season: seasonRank,
      profile_url: `/u/${profile.username}`,
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
