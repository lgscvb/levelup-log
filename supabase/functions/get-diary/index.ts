import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';

const MAX_DAYS = 90;
const DEFAULT_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');
    const daysParam = url.searchParams.get('days');

    const supabase = getSupabaseClient(authHeader);

    // Query by specific date
    if (dateParam) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return new Response(JSON.stringify({ error: 'date must be in YYYY-MM-DD format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: entries, error: queryError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', dateParam)
        .order('entry_date', { ascending: false });

      if (queryError) throw queryError;

      return new Response(JSON.stringify({ entries: entries ?? [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Query by recent N days
    let days = DEFAULT_DAYS;
    if (daysParam !== null) {
      const parsed = parseInt(daysParam, 10);
      if (isNaN(parsed) || parsed < 1) {
        return new Response(JSON.stringify({ error: 'days must be a positive integer' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      days = Math.min(parsed, MAX_DAYS);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (days - 1));
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const { data: entries, error: queryError } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', cutoffStr)
      .order('entry_date', { ascending: false });

    if (queryError) throw queryError;

    return new Response(JSON.stringify({ entries: entries ?? [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
