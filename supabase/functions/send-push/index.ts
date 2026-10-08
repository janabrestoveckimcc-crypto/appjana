import {createClient} from 'npm:@supabase/supabase-js@2';
import {z} from 'npm:zod@4';
import {authenticate} from '../_shared/auth.ts';
import {serverConfig} from '../_shared/config.ts';
import {corsHeaders,jsonResponse} from '../_shared/cors.ts';
import {errorResponse,AppError} from '../_shared/errors.ts';
import {vapid,deliverPush,allowedPushEndpoint} from '../_shared/push.ts';
const input=z.object({action:z.enum(['config','test'])}).strict();
const messages={hr:{blago:'Tu sam. Tvoj sljedeći mali korak može pričekati trenutak za tebe. 💙',sarkasticno:'Test prošao. Sad znamo da te tvoj budući ti može podsjetiti. 😉',brutalno:'Veza radi. Tvoj budući ti javlja se — vrijeme je za mali pomak.'},en:{blago:'I’m here. One small step, whenever you’re ready. 💙',sarkasticno:'Test passed. Your future self now knows how to reach you. 😉',brutalno:'Connection works. Your future self is here — time for one small step.'}};
Deno.serve(async(request:Request)=>{
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:corsHeaders});
 let language:'hr'|'en'='hr';
 try{
  if(request.method!=='POST')throw new AppError('REQ-0001');
  const {client,user,profile}=await authenticate(request);language=profile.language;
  const parsed=input.safeParse(await request.json());if(!parsed.success)throw new AppError('REQ-0002');
  const configured=Boolean(vapid.publicKey&&vapid.privateKey&&vapid.subject);
  if(parsed.data.action==='config')return jsonResponse({configured,publicKey:configured?vapid.publicKey:null});
  if(!configured)return jsonResponse({code:'PUSH_NOT_CONFIGURED'},503);
  const {data:subscriptions,error}=await client.from('push_subscriptions').select('id,endpoint,p256dh,auth').eq('user_id',user.id);
  if(error)throw new AppError('SYS-0001');
  const valid=(subscriptions??[]).filter(s=>allowedPushEndpoint(s.endpoint));
  if(!valid.length)return jsonResponse({code:'PUSH_NO_DEVICE'},409);
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,serverConfig.serviceRoleKey,{auth:{persistSession:false}});
  const tone=profile.tone as keyof typeof messages.hr;
  const text=messages[language][tone]??messages[language].blago;
  let notificationId:string|null=null;
  // Existing unique index reserves at most three manual tests per Zagreb day,
  // even when simultaneous requests arrive. No schema migration is required.
  for(let slot=1;slot<=3;slot++){
   const result=await admin.from('notifications').insert({user_id:user.id,template_key:`push_test_${slot}`,text}).select('id').single();
   if(!result.error){notificationId=result.data.id;break;}
   if(result.error.code!=='23505')throw new AppError('SYS-0001');
  }
  if(!notificationId)return jsonResponse({code:'PUSH_DAILY_LIMIT'},429);
  let sent=0,expired=0,failed=0;
  for(const subscription of valid){
   try{
    const status=await deliverPush(subscription,{title:'relAI',body:text,tag:notificationId,url:'/',notificationId});
    if(status>=200&&status<300)sent++;
    else if(status===404||status===410){expired++;await admin.from('push_subscriptions').delete().eq('id',subscription.id).eq('user_id',user.id);}
    else failed++;
   }catch{failed++;}
  }
  if(sent){const update=await admin.from('notifications').update({pushed_at:new Date().toISOString()}).eq('id',notificationId).eq('user_id',user.id);if(update.error)throw new AppError('SYS-0001');}
  return jsonResponse({sent,expired,failed,code:sent?'PUSH_SENT':'PUSH_FAILED'},sent?200:502);
 }catch(error){return errorResponse(error,language);}
});
