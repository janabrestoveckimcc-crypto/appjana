import { getSupabase } from '../../../lib/supabase';
import { profileSchema } from '../profile.types';
import type { Profile, ProfileInput } from '../profile.types';
const columns = 'id,display_name,tone,language,avatar_config,hp,map_index,presence,streak_days,last_completed_date,friend_code,created_at';
export async function readProfile(userId: string): Promise<Profile> {
  const { data, error } = await getSupabase().from('profiles').select(columns).eq('id',userId).single();
  if (error) throw error;
  return data;
}
export async function saveProfile(userId: string, input: ProfileInput): Promise<Profile> {
  const clean = profileSchema.parse(input);
  const { data, error } = await getSupabase().from('profiles').update(clean).eq('id',userId).select(columns).single();
  if (error) throw error;
  return data;
}
