import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const isBackendConfigured = Boolean(url && /^https?:\/\//.test(url) && key);
export const supabase = isBackendConfigured ? createClient<Database>(url, key) : null;

export function getSupabase(): NonNullable<typeof supabase> {
  if (!supabase) throw new Error('BACKEND_NOT_CONFIGURED');
  return supabase;
}
