import {getSupabase} from './supabase';
import type {Database} from './database.types';
type Task=Database['public']['Tables']['tasks']['Row'];
type Document=Database['public']['Tables']['documents']['Row'];
export type ExtractionResult={document:Document;task:Task|null;duplicate:boolean};
async function invoke<T>(name:string,body:Record<string,unknown>):Promise<T>{
 const {data,error}=await getSupabase().functions.invoke(name,{body});
 if(error){
  let detail='';if(error.context instanceof Response){const result=await error.context.json().catch(()=>null);detail=result?.detail??result?.code??'';}
  throw new Error(detail||error.message);
 }
 return data as T;
}
export async function loadCloudState(){
 const db=getSupabase();
 const [documents,tasks,profile,ledger]=await Promise.all([
  db.from('documents').select('*').order('created_at',{ascending:false}).limit(100),
  db.from('tasks').select('*').order('created_at',{ascending:false}).limit(300),
  db.from('profiles').select('*').single(),
  db.from('hp_ledger').select('amount').limit(10000),
 ]);
 for(const result of [documents,tasks,profile,ledger])if(result.error)throw result.error;
 return {documents:documents.data!,tasks:tasks.data!,profile:profile.data!,totalHP:ledger.data!.reduce((sum,row)=>sum+row.amount,0)};
}
export async function uploadDocument(blob:Blob,documentId=crypto.randomUUID()):Promise<ExtractionResult>{
 const db=getSupabase();const {data:auth,error:authError}=await db.auth.getUser();
 if(authError||!auth.user)throw new Error('AUTH-0001');
 const extension=blob.type==='application/pdf'?'pdf':'jpg';
 if(!['application/pdf','image/jpeg'].includes(blob.type)||blob.size>10*1024*1024)throw new Error('INVALID_FILE');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),byte=>byte.toString(16).padStart(2,'0')).join('');
 const {data:duplicate,error:duplicateError}=await db.from('documents').select('id').eq('file_hash',hash).maybeSingle();
 if(duplicateError)throw duplicateError;if(duplicate)throw new Error('DUPLICATE_DOCUMENT');
 const path=`${auth.user.id}/${documentId}.${extension}`;
 const {error}=await db.storage.from('documents').upload(path,blob,{contentType:blob.type,upsert:false});
 if(error)throw error;
 // Keep the uploaded file available for explicit retry if extraction fails.
 try{return await invoke<ExtractionResult>('extract-document',{document_id:documentId,extension});}
 catch(error){throw Object.assign(error instanceof Error?error:new Error('EXTRACTION_FAILED'),{documentId,extension});}
}
export const retryExtraction=(documentId:string,extension:'jpg'|'pdf')=>invoke<ExtractionResult>('extract-document',{document_id:documentId,extension});
export async function readCloudFile(id:string):Promise<Blob>{
 const db=getSupabase();const {data,error}=await db.from('documents').select('storage_path').eq('id',id).single();
 if(error)throw error;
 const download=await db.storage.from('documents').download(data.storage_path);
 if(download.error)throw download.error;return download.data;
}
export async function undoCloudTask(id:string){
 const {error}=await getSupabase().from('tasks').delete().eq('id',id).eq('status','open');if(error)throw error;
}
export async function editCloudTask(id:string,changes:Pick<Task,'title'|'start_at'|'due_date'|'remind_at'>){
 const {error}=await getSupabase().from('tasks').update(changes).eq('id',id).eq('status','open');if(error)throw error;
}
export const completeCloudTask=(id:string)=>invoke('complete-task',{task_id:id});
export const sendCloudMessage=(message:string)=>invoke<{reply:string;tasks:Task[]}>('assistant-chat',{message});
export async function readCloudMessages(){
 const {data,error}=await getSupabase().from('chat_messages').select('role,content').order('created_at',{ascending:false}).limit(10);
 if(error)throw error;return data.reverse();
}
