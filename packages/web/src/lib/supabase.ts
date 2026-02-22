/**
 * Re-export the browser client as the default Supabase client.
 *
 * This preserves backward compatibility for any existing Client Component
 * imports like `import { supabase } from '@/lib/supabase'`.
 *
 * For new code, prefer importing directly:
 * - Server Components / Route Handlers: `import { createSupabaseServer } from '@/lib/supabase-server'`
 * - Client Components: `import { createSupabaseBrowser } from '@/lib/supabase-browser'`
 */
export { createSupabaseBrowser } from './supabase-browser';

import { createSupabaseBrowser } from './supabase-browser';

/** @deprecated Use `createSupabaseBrowser()` or `createSupabaseServer()` instead. */
export const supabase = createSupabaseBrowser();
