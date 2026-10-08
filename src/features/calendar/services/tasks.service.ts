import { getSupabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export async function readTasks(): Promise<TaskRow[]> {
  const {data,error} = await getSupabase().from('tasks').select('id,user_id,document_id,kind,title,tier,source,start_at,remind_at,due_date,recurrence,status,completed_at,proof_document_id,proof_reason,penalty_applied,created_at').order('due_date',{ascending:true}).limit(500);
  if (error) throw error;
  return data;
}
