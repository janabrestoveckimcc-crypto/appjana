import { getSupabase } from '../../../lib/supabase';
import type { Database } from '../../../lib/database.types';
export type DocumentRow = Database['public']['Tables']['documents']['Row'];
export async function readDocuments(): Promise<DocumentRow[]> {
  const {data,error} = await getSupabase().from('documents').select('id,user_id,title,category,mime_type,document_date,expiry_date,created_at,storage_path,extracted,file_hash,is_proof').order('created_at',{ascending:false}).limit(50);
  if (error) throw error;
  return data;
}
export async function documentUrl(path: string): Promise<string> {
  const {data,error} = await getSupabase().storage.from('documents').createSignedUrl(path,600);
  if (error) throw error;
  return data.signedUrl;
}
