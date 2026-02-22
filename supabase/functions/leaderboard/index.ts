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

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'season';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

    const supabase = getSupabaseClient(authHeader);

    let leaderboard: Array<{
      rank: number;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
      xp: number;
      is_self: boolean;
    }> = [];

    let myRank: number | null = null;

    if (type === 'season') {
      // Get active season leaderboard
      const { data: activeSeason } = await supabase
        .from('seasons')
        .select('id, name')
        .eq('is_active', true)
        .single();

      if (activeSeason) {
        const { data: participants } = await supabase
          .from('season_participants')
          .select('user_id, season_xp, profiles(username, display_name, avatar_url)')
          .eq('season_id', activeSeason.id)
          .order('season_xp', { ascending: false })
          .limit(limit);

        leaderboard = (participants || []).map((p, i) => ({
          rank: i + 1,
          username: (p.profiles as any)?.username || 'unknown',
          display_name: (p.profiles as any)?.display_name,
          avatar_url: (p.profiles as any)?.avatar_url,
          xp: p.season_xp,
          is_self: p.user_id === user.id,
        }));

        // Get my rank if not in top N
        if (!leaderboard.some(e => e.is_self)) {
          const { data: myParticipant } = await supabase
            .from('season_participants')
            .select('season_xp')
            .eq('season_id', activeSeason.id)
            .eq('user_id', user.id)
            .single();

          if (myParticipant) {
            const { count } = await supabase
              .from('season_participants')
              .select('*', { count: 'exact', head: true })
              .eq('season_id', activeSeason.id)
              .gt('season_xp', myParticipant.season_xp);

            myRank = (count || 0) + 1;
          }
        }
      }
    } else {
      // All-time or monthly leaderboard from profiles
      const xpField = type === 'month' ? 'year_xp' : 'total_xp';

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, total_xp, year_xp')
        .order(xpField, { ascending: false })
        .limit(limit);

      leaderboard = (profiles || []).map((p, i) => ({
        rank: i + 1,
        username: p.username,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        xp: type === 'month' ? p.year_xp : p.total_xp,
        is_self: p.id === user.id,
      }));

      if (!leaderboard.some(e => e.is_self)) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select(xpField)
          .eq('id', user.id)
          .single();

        if (myProfile) {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt(xpField, (myProfile as any)[xpField]);

          myRank = (count || 0) + 1;
        }
      }
    }

    return new Response(JSON.stringify({
      type,
      leaderboard,
      my_rank: myRank || leaderboard.find(e => e.is_self)?.rank || null,
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
