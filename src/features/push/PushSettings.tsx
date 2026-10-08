import {useEffect,useState} from 'react';
import {useT} from '../../lib/i18n/use-t';
import {disablePush,enablePush,isAppleMobile,preparePush,pushRequest,pushSupported,standalone,saveSubscription} from './push.service';
import './push.css';
export function PushSettings({userId,close}:{userId:string;close:()=>void}){
 const {t}=useT();const [ready,setReady]=useState<Awaited<ReturnType<typeof preparePush>>|null>(null);
 const [enabled,setEnabled]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const appleInstall=isAppleMobile()&&!standalone();
 const supported=pushSupported();
 function explain(error:unknown){const code=error instanceof Error?error.message:'';return code==='PUSH_NOT_CONFIGURED'?t.pushNotConfigured:code==='PUSH_DENIED'?t.pushDenied:code==='PUSH_DAILY_LIMIT'?t.pushDailyLimit:code==='PUSH_NO_DEVICE'?t.pushNoDevice:t.pushFailed;}
 useEffect(()=>{
  if(!supported||appleInstall)return;let alive=true;
  void preparePush().then(async value=>{
   const subscription=await value.registration.pushManager.getSubscription();
   // Re-save on account change under RLS; a device cannot be silently reassigned.
   if(subscription)await saveSubscription(subscription,userId);
   if(alive){setReady(value);setEnabled(Boolean(subscription));}
  }).catch(error=>{if(alive)setMessage(explain(error));});
  return()=>{alive=false;};
 // Reloading this modal reads the current device status; no permission on mount.

 },[userId,supported,appleInstall]);
 async function enable(){if(!ready||busy)return;setBusy(true);setMessage('');try{await enablePush(ready.registration,ready.publicKey,userId);setEnabled(true);setMessage(t.pushEnabled);}catch(error){setMessage(explain(error));}finally{setBusy(false);}}
 async function disable(){if(!ready||busy)return;setBusy(true);try{await disablePush(ready.registration,userId);setEnabled(false);setMessage(t.pushDisabled);}catch(error){setMessage(explain(error));}finally{setBusy(false);}}
 async function test(){if(busy)return;setBusy(true);setMessage('');try{const result=await pushRequest('test');setMessage(result.sent?t.pushSent:t.pushFailed);}catch(error){setMessage(explain(error));}finally{setBusy(false);}}
 return <div className="push-overlay"><section role="dialog" aria-modal="true" aria-labelledby="push-title" className="push-panel"><button className="push-close" onClick={close} aria-label={t.pushClose}>×</button><h2 id="push-title">{t.pushTitle}</h2><p>{t.pushDescription}</p>{appleInstall?<p>{t.pushInstall}</p>:!supported?<p>{t.pushUnsupported}</p>:<><button disabled={!ready||busy} onClick={enabled?disable:enable}>{enabled?t.pushDisable:t.pushEnable}</button><button disabled={!ready||!enabled||busy} onClick={test}>{t.pushTest}</button><p className="push-note">{t.pushLimitNote}</p></>}<p role="status" aria-live="polite">{message||(!ready&&supported&&!appleInstall?t.aiChecking:'')}</p></section></div>;
}
