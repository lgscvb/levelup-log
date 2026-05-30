import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';

const DEFAULT_STATS = {
  momentum_score: 0,
  initiation_score: 0,
  completion_score: 0,
  recovery_score: 0,
  focus_score: 0,
  quests_started: 0,
  quests_completed: 0,
  rough_versions_count: 0,
  returned_count: 0,
  anti_tasks_stopped: 0,
};

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

    const { data: stats } = await supabase
      .from('user_momentum_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { count: activeQuestCount } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['planned', 'started', 'rough_done']);

    const { data: recentEvents } = await supabase
      .from('quest_events')
      .select('id, quest_id, event_type, summary, momentum_delta, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return new Response(JSON.stringify({
      ...(stats || DEFAULT_STATS),
      active_quest_count: activeQuestCount || 0,
      recent_events: recentEvents || [],
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
