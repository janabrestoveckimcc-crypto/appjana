import {serverConfig} from '../_shared/config.ts';
import {authenticate} from '../_shared/auth.ts';
import {corsHeaders,jsonResponse} from '../_shared/cors.ts';
import {AppError,errorResponse} from '../_shared/errors.ts';
import {checkGemini} from '../_shared/gemini.ts';
import {z} from 'npm:zod@4';
const requestSchema=z.object({action:z.enum(['models','check'])}).strict();
Deno.serve(async(request:Request)=>{
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders});
 let language:'hr'|'en'='hr';
 try{
  if(request.method!=='POST')throw new AppError('REQ-0001');
  const {profile}=await authenticate(request);language=profile.language;
  if(!serverConfig.geminiApiKey)throw new AppError('AI-0001');
  const text=await request.text();
  if(text.length>128)throw new AppError('REQ-0002');
  let raw:unknown;try{raw=JSON.parse(text);}catch{throw new AppError('REQ-0002');}
  const parsed=requestSchema.safeParse(raw);if(!parsed.success)throw new AppError('REQ-0002');
  const body=parsed.data;
  if(body.action==='models'){
   const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models',{headers:{'x-goog-api-key':serverConfig.geminiApiKey},signal:AbortSignal.timeout(20000)});
   if(!response.ok){
    const failure=await response.json().catch(()=>({}));
    const knownReasons=['API_KEY_INVALID','API_KEY_SERVICE_BLOCKED','API_KEY_HTTP_REFERRER_BLOCKED','API_KEY_IP_ADDRESS_BLOCKED','SERVICE_DISABLED','BILLING_DISABLED','CONSUMER_INVALID','ACCESS_TOKEN_SCOPE_INSUFFICIENT'];
    const reasons=(failure.error?.details??[]).map((d:{reason?:string})=>d.reason).filter((r:string)=>knownReasons.includes(r));
    const message=String(failure.error?.message??'').toLowerCase();
    return jsonResponse({code:'MODEL_LIST_FAILED',upstreamStatus:response.status,reasons,keyRejected:message.includes('api key')&&(message.includes('invalid')||message.includes('not valid')||message.includes('expired')),unregisteredCaller:message.includes('unregistered callers'),permissionDenied:failure.error?.status==='PERMISSION_DENIED'},502);
   }
   const result=await response.json();
   return jsonResponse({models:result.models?.filter((m:{name:string;supportedGenerationMethods?:string[]})=>m.name.includes('flash')&&m.supportedGenerationMethods?.includes('generateContent')).map((m:{name:string})=>m.name)});
  }
  return jsonResponse(await checkGemini({apiKey:serverConfig.geminiApiKey,language,tone:profile.tone,now:new Date(),fetcher:fetch}));
 }catch(error){return errorResponse(error,language);}
});
