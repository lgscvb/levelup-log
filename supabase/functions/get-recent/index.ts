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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const days = Math.min(parseInt(url.searchParams.get('days') || '7'), 365);
    const category = url.searchParams.get('category');

    const supabase = getSupabaseClient(authHeader);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    let query = supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .gte('recorded_at', cutoff.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: achievements, error } = await query;
    if (error) throw error;

    // Group by date
    const grouped: Record<string, typeof achievements> = {};
    for (const a of achievements || []) {
      const date = a.recorded_at.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(a);
    }

    return new Response(JSON.stringify({
      achievements,
      grouped,
      total: achievements?.length || 0,
      period: `Last ${days} days`,
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
