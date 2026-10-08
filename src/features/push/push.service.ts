import {getSupabase} from '../../lib/supabase';
export async function pushRequest(action:'config'|'test'){
 const {data,error}=await getSupabase().functions.invoke('send-push',{body:{action}});
 if(error){let code='PUSH_FAILED';if(error.context instanceof Response){const detail=await error.context.json().catch(()=>null);code=detail?.code??code;}throw new Error(code);}
 return data as {configured?:boolean;publicKey?:string;sent?:number};
}
export function pushSupported(){return window.isSecureContext&&'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;}
export function standalone(){return window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone);}
export function isAppleMobile(){return /iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function applicationKey(value:string):ArrayBuffer{
 const encoded=value.replace(/-/g,'+').replace(/_/g,'/');const binary=atob(encoded+'='.repeat((4-encoded.length%4)%4));return Uint8Array.from(binary,char=>char.charCodeAt(0)).buffer;
}
export async function preparePush(){
 const config=await pushRequest('config');if(!config.configured||!config.publicKey)throw new Error('PUSH_NOT_CONFIGURED');
 const registration=await navigator.serviceWorker.register('/sw.js',{scope:'/'});
 await navigator.serviceWorker.ready;
 return {registration,publicKey:config.publicKey};
}
export async function saveSubscription(subscription:PushSubscription,userId:string){
 const json=subscription.toJSON();if(!json.keys?.p256dh||!json.keys.auth)throw new Error('PUSH_FAILED');
 const {error}=await getSupabase().from('push_subscriptions').upsert({user_id:userId,endpoint:subscription.endpoint,p256dh:json.keys.p256dh,auth:json.keys.auth},{onConflict:'endpoint'});
 if(error)throw new Error('PUSH_SAVE_FAILED');
}
export async function enablePush(registration:ServiceWorkerRegistration,publicKey:string,userId:string){
 // Called directly by the button, before network work or other awaits.
 const request=Notification.requestPermission();
 let timer:ReturnType<typeof setTimeout>|undefined;
 const permission=await Promise.race([request,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('PUSH_DENIED')),20000);})]).finally(()=>clearTimeout(timer));
 if(permission!=='granted')throw new Error('PUSH_DENIED');
 let subscription=await registration.pushManager.getSubscription();
 if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:applicationKey(publicKey)});
 await saveSubscription(subscription,userId);return subscription;
}
export async function disablePush(registration:ServiceWorkerRegistration,userId:string){
 const subscription=await registration.pushManager.getSubscription();if(!subscription)return;
 const {error}=await getSupabase().from('push_subscriptions').delete().eq('endpoint',subscription.endpoint).eq('user_id',userId);
 if(error)throw new Error('PUSH_SAVE_FAILED');
 if(!await subscription.unsubscribe())throw new Error('PUSH_FAILED');
}
