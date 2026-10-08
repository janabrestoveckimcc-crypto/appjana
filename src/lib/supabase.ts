import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const isBackendConfigured = Boolean(url && /^https?:\/\//.test(url) && key);
// Database typing is added only from CLI-generated types after linking the team's existing schema.
export const supabase = isBackendConfigured ? createClient(url, key) : null;

export function getSupabase(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('BACKEND_NOT_CONFIGURED');
  return supabase;
}
