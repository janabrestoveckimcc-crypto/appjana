import { getSupabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
export type ChatRow = Database['public']['Tables']['chat_messages']['Row'];
export async function readMessages(): Promise<ChatRow[]> {
  const {data,error} = await getSupabase().from('chat_messages').select('id,user_id,role,content,created_at').order('created_at',{ascending:false}).limit(50);
  if (error) throw error;
  return data.reverse();
}
