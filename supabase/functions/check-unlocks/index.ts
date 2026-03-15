import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';
import { checkAndUnlockTitles } from '../_shared/unlock-titles.ts';

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

    const { newly_unlocked, progress } = await checkAndUnlockTitles(
      supabase,
      user.id,
      profile,
    );

    // Get total unlocked count for display
    const { count: totalUnlocked } = await supabase
      .from('user_titles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({
      newly_unlocked,
      progress,
      total_unlocked: totalUnlocked ?? 0,
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
