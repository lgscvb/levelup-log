import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, getAuthUser } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
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

    // Parse body
    const body = await req.json();
    const { content, entry_date, achievement_ids } = body;

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate entry_date format if provided
    let resolvedDate: string;
    if (entry_date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
        return new Response(JSON.stringify({ error: 'entry_date must be in YYYY-MM-DD format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      resolvedDate = entry_date;
    } else {
      resolvedDate = new Date().toISOString().split('T')[0];
    }

    // Validate achievement_ids if provided
    if (achievement_ids !== undefined && !Array.isArray(achievement_ids)) {
      return new Response(JSON.stringify({ error: 'achievement_ids must be an array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = getSupabaseClient(authHeader);

    // Upsert on conflict (user_id, entry_date)
    const { data: entry, error: upsertError } = await supabase
      .from('diary_entries')
      .upsert(
        {
          user_id: user.id,
          entry_date: resolvedDate,
          content: content.trim(),
          achievement_ids: achievement_ids ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,entry_date' }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    return new Response(JSON.stringify({ entry }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
