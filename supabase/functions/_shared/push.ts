import webpush from 'npm:web-push@3.6.7';
export const vapid={publicKey:Deno.env.get('VAPID_PUBLIC_KEY')??'',privateKey:Deno.env.get('VAPID_PRIVATE_KEY')??'',subject:Deno.env.get('VAPID_SUBJECT')??''};
export function allowedPushEndpoint(value:string):boolean{
 try{const url=new URL(value);const host=url.hostname;return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&(host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com'||host.endsWith('.push.services.mozilla.com')||host.endsWith('.push.apple.com')||host.endsWith('.notify.windows.com'));}catch{return false;}
}
export async function deliverPush(subscription:{endpoint:string;p256dh:string;auth:string},payload:unknown):Promise<number>{
 if(!allowedPushEndpoint(subscription.endpoint))return 400;
 const details=webpush.generateRequestDetails({endpoint:subscription.endpoint,keys:{p256dh:subscription.p256dh,auth:subscription.auth}},JSON.stringify(payload),{vapidDetails:vapid,TTL:300,urgency:'normal'});
 const result=await fetch(details.endpoint,{method:details.method,headers:details.headers,body:new Uint8Array(details.body),redirect:'error',signal:AbortSignal.timeout(10000)});
 await result.body?.cancel();return result.status;
}
