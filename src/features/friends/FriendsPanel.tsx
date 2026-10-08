import {useEffect,useRef,useState} from 'react';
import {useT} from '../../lib/i18n/use-t';
import {inviteFriend,readCircle,respondToInvite,type Circle} from './friends.service';
import './friends.css';

export function FriendsPanel({close}:{close:()=>void}){
 const {t}=useT();
 const dialog=useRef<HTMLDialogElement>(null);
 const [circle,setCircle]=useState<Circle|null>(null);
 const [username,setUsername]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [loadFailed,setLoadFailed]=useState(false);
 const messages:Record<string,string>={SENT:t.friendSent,ACCEPTED:t.friendAccepted,DECLINED:t.friendDeclined,NOT_FOUND:t.friendNotFound,SELF:t.friendSelf,INVALID_USERNAME:t.friendInvalid,ALREADY_FRIENDS:t.friendAlready,ALREADY_PENDING:t.friendPending,ALREADY_RESOLVED:t.friendResolved,LIMIT:t.friendLimit};
 async function refresh(){try{setCircle(await readCircle());setLoadFailed(false);}catch{setLoadFailed(true);}}
 useEffect(()=>{
  dialog.current?.showModal();
  let active=true;
  const load=()=>{void readCircle().then(data=>{if(active){setCircle(data);setLoadFailed(false);}}).catch(()=>{if(active)setLoadFailed(true);});};
  load();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')load();},30000);
  window.addEventListener('focus',load);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',load);};
 },[]);
 async function act(action:()=>Promise<string>){
  if(busy)return;
  setBusy(true);setMessage('');
  try{const code=await action();setMessage(messages[code]??t.friendError);if(code==='SENT')setUsername('');await refresh();}
  catch{setMessage(t.friendError);}finally{setBusy(false);}
 }
 function avatar(person:Circle['friends'][number]){return <span className="friend-face"><img src={person.avatar.gender==='male'?'/game/avatar-male-v4.png':'/game/avatar-female-v4.png'} alt=""/></span>;}
 return <dialog ref={dialog} className="friends-panel" aria-labelledby="friends-title" onCancel={event=>{event.preventDefault();close();}}>
  <header><div><span className="friends-eyebrow">relAI · YOUR CIRCLE</span><h2 id="friends-title">{t.friendTitle}</h2></div><button className="friends-close" aria-label={t.friendClose} onClick={close}>×</button></header>
  <p className="friends-muted">{t.friendIntro}</p>
  <form onSubmit={event=>{event.preventDefault();void act(()=>inviteFriend(username));}}>
   <label htmlFor="friend-username">{t.friendUsername}</label>
   <div className="friend-input-row"><input id="friend-username" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="@username" value={username} onChange={event=>setUsername(event.target.value)} maxLength={25} pattern="@?[A-Za-z0-9_.]{3,24}" required disabled={busy}/><button disabled={busy||!username.trim()}>{t.friendInvite}</button></div>
  </form>
  <p role="status" className="friends-status">{message}</p>
  <button className="friends-refresh" onClick={()=>void refresh()} disabled={busy}>{t.friendRefresh}</button>
  {loadFailed?<p role="alert">{t.friendError}</p>:!circle?<p>{t.friendLoading}</p>:<>
   <section><h3>{t.friendIncoming} <span>{circle.incoming.length}</span></h3>{!circle.incoming.length?<p className="friends-muted">{t.friendNoIncoming}</p>:<ul>{circle.incoming.map(person=><li key={person.id}>{avatar(person)}<strong>@{person.username}</strong><div className="friend-actions"><button disabled={busy} onClick={()=>void act(()=>respondToInvite(person.id,true))}>{t.friendAccept}</button><button className="friend-secondary" disabled={busy} onClick={()=>void act(()=>respondToInvite(person.id,false))}>{t.friendDecline}</button></div></li>)}</ul>}</section>
   <section><h3>{t.friendMembers} <span>{circle.friends.length}</span></h3>{!circle.friends.length?<p className="friends-muted">{t.friendEmpty}</p>:<ul>{circle.friends.map(person=><li key={person.id}>{avatar(person)}<strong>@{person.username}</strong><span className="friend-connected">✓</span></li>)}</ul>}</section>
   <section><h3>{t.friendOutgoing} <span>{circle.outgoing.length}</span></h3>{!circle.outgoing.length?<p className="friends-muted">{t.friendNoOutgoing}</p>:<ul>{circle.outgoing.map(person=><li key={person.id}>{avatar(person)}<strong>@{person.username}</strong><small>{t.friendWaiting}</small></li>)}</ul>}</section>
  </>}
  <p className="friends-muted friends-privacy">{t.friendPrivacy}</p>
 </dialog>;
}
