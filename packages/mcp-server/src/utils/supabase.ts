import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from './config.js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(accessToken?: string): SupabaseClient {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase not configured. Run `npx @levelup-log/mcp-server init` to set up.'
    );
  }

  if (accessToken) {
    // Create a client with the user's JWT for RLS
    return createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    });
  }

  if (!supabaseClient) {
    supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }

  return supabaseClient;
}
