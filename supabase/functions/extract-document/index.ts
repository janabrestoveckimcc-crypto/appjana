import {createClient} from 'npm:@supabase/supabase-js@2';
import {z} from 'npm:zod@4';
import {authenticate} from '../_shared/auth.ts';
import {serverConfig} from '../_shared/config.ts';
import {corsHeaders,jsonResponse} from '../_shared/cors.ts';
import {AppError,errorResponse} from '../_shared/errors.ts';
import {generateJSON} from '../_shared/generate-json.ts';
import {extractedDocument,extractionResponseSchema} from '../_shared/extraction-schema.ts';
import {extractionPrompt} from '../_shared/prompts.ts';
import {followUpDates,toZagrebInstant} from '../_shared/rules.ts';
const inputSchema=z.object({document_id:z.string().uuid(),extension:z.enum(['jpg','pdf'])}).strict();
Deno.serve(async(request:Request)=>{
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders});
 let language:'hr'|'en'='hr';
 try{
  if(request.method!=='POST')throw new AppError('REQ-0001');
  const {user,client,profile}=await authenticate(request);language=profile.language;
  const parsed=inputSchema.safeParse(await request.json());if(!parsed.success)throw new AppError('REQ-0002');
  const {document_id,extension}=parsed.data;
  const path=`${user.id}/${document_id}.${extension}`;
  const {data:file,error:downloadError}=await client.storage.from('documents').download(path);
  if(downloadError||!file||file.size>10*1024*1024)throw new AppError('REQ-0002');
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(extension==='pdf'?new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-':bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw new AppError('REQ-0002');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
  const {data:existing,error:readError}=await client.from('documents').select('id').eq('user_id',user.id).eq('file_hash',hash).maybeSingle();
  if(readError)throw new AppError('SYS-0001');
  if(existing)return jsonResponse({code:'DUPLICATE_DOCUMENT',detail:language==='hr'?'Ova je datoteka već spremljena.':'This file has already been saved.'},409);
  let binary='';for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));
  const mime=extension==='pdf'?'application/pdf':'image/jpeg';
  const extracted=await generateJSON({language,tone:profile.tone,prompt:extractionPrompt,parts:[{inlineData:{mimeType:mime,data:btoa(binary)}}],schema:extractionResponseSchema,parse:value=>extractedDocument.parse(value),now:new Date()});
  const dates=followUpDates(extracted.document_date,extracted.follow_up,extracted.expiry_date);
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,serverConfig.serviceRoleKey,{auth:{persistSession:false}});
  const {data,error}=await admin.rpc('save_extracted_document',{p_user_id:user.id,p_document:{id:document_id,storage_path:path,file_hash:hash,mime_type:mime,category:extracted.category,title:extracted.title,document_date:extracted.document_date?toZagrebInstant(extracted.document_date):null,expiry_date:extracted.expiry_date?toZagrebInstant(extracted.expiry_date):null,extracted},p_task:dates?{title:extracted.title,tier:extracted.suggested_tier,remind_at:toZagrebInstant(dates.remind_at),due_date:toZagrebInstant(dates.due_date,'23:59')}:null});
  if(error)throw new AppError('SYS-0001');
  return jsonResponse(data);
 }catch(error){return errorResponse(error,language);}
});
