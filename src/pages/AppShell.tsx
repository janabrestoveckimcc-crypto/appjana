import {PushSettings} from '../features/push/PushSettings';
import {useEffect,useRef,useState} from 'react';
import {z} from 'zod';
import {useProfile} from '../features/profile/hooks/use-profile';
import {getSupabase} from '../lib/supabase';
import {useT} from '../lib/i18n/use-t';
import {QueryState} from '../components/shared/QueryState';
import {signOut} from '../features/onboarding/services/auth.service';
import {useQueryClient} from '@tanstack/react-query';
const appearance=z.object({
 gender:z.enum(['female','male']),height:z.number().min(100).max(250),build:z.number().min(0).max(100),
 eyes:z.string().regex(/^#[0-9a-f]{6}$/i),hair:z.string().regex(/^#[0-9a-f]{6}$/i),
 hairLength:z.string().max(20).optional(),beard:z.string().max(20).optional(),
});
const update=z.object({
 profile:z.object({username:z.string().regex(/^[A-Za-z0-9_.]{3,24}$/)}),
 avatar:appearance,
 prefs:z.object({language:z.enum(['hr','en']),tone:z.enum(['supportive','direct','roast'])}),
});
// Preserve original CSS in an isolated document. No auth token enters the frame.
// Only profile edits reach Supabase; prototype task/HP state is not cloud data.
export function AppShell({userId}:{userId:string}){
 const {profile}=useProfile(userId);
 const {t}=useT();
 const cache=useQueryClient();
 const frame=useRef<HTMLIFrameElement>(null);
 const [failed,setFailed]=useState(false);
 const [pushOpen,setPushOpen]=useState(false);
 const [diagnostic,setDiagnostic]=useState('');
 const [checking,setChecking]=useState(false);
 async function checkAI(action:string){
  if(checking)return;
  setChecking(true);
  setDiagnostic(t.aiChecking);
  try{
   const {data,error}=await getSupabase().functions.invoke('gemini-check',{body:{action}});
   let details=data;
   if(error?.context instanceof Response)details=await error.context.json().catch(()=>null);
   setDiagnostic(JSON.stringify(details??{error:error?.message}));
  }catch{setDiagnostic(t.aiCheckFailed);}
  finally{setChecking(false);}
 }
 useEffect(()=>{
  const data=profile.data;if(!data)return;
  let timer:ReturnType<typeof setTimeout>|undefined;
  let active=true,lastSaved='';
  const sendInitial=()=>frame.current?.contentWindow?.postMessage({
   type:'relai:init',userId,language:data.language,
   profile:data.display_name?{username:data.display_name,firstName:'',lastName:'',birthDate:'',gender:'female'}:null,
   avatar:appearance.safeParse(data.avatar_config).success?data.avatar_config:undefined,
  },window.location.origin);
  function receive(event:MessageEvent){
   if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow)return;
   if(event.data?.type==='relai:push'){setPushOpen(true);return;}
   if(event.data?.type==='relai:ready'){sendInitial();return;}
   if(event.data?.type==='relai:logout'){
    void signOut().then(()=>cache.clear()).catch(()=>setFailed(true));return;
   }
   if(event.data?.type!=='relai:profile')return;
   const parsed=update.safeParse(event.data.state);if(!parsed.success)return;
   const value=parsed.data;
   const clean={display_name:value.profile.username,language:value.prefs.language,
    tone:({supportive:'blago',direct:'sarkasticno',roast:'brutalno'} as const)[value.prefs.tone],avatar_config:value.avatar};
   const key=JSON.stringify(clean);if(key===lastSaved)return;
   clearTimeout(timer);
   timer=setTimeout(()=>{
    void getSupabase().from('profiles').update(clean).eq('id',userId).then(({error})=>{
     if(!active)return;setFailed(Boolean(error));if(!error)lastSaved=key;
    });
   },500);
  }
  window.addEventListener('message',receive);sendInitial();
  return()=>{active=false;clearTimeout(timer);window.removeEventListener('message',receive);};
 },[userId,profile.data,cache]);
 if(!profile.data)return <main className="app-shell"><QueryState loading={profile.isPending} error={profile.isError} retry={()=>void profile.refetch()}/></main>;
 return <>{pushOpen&&<PushSettings userId={userId} close={()=>setPushOpen(false)}/>}<iframe ref={frame} src="/experience.html" title="relAI" className="approved-experience"/>{new URLSearchParams(location.search).has('ai-check')&&<aside style={{position:'fixed',top:0,left:0,zIndex:9999,background:'#132436',padding:16,maxWidth:'100%'}}><button disabled={checking} onClick={()=>void checkAI('models')}>{t.aiListModels}</button><button disabled={checking} onClick={()=>void checkAI('check')}>{t.aiTest}</button><pre role="status" style={{whiteSpace:'pre-wrap'}}>{diagnostic}</pre></aside>}{failed&&<p role="alert" className="experience-save-error">{t.saveError}</p>}</>;
}
