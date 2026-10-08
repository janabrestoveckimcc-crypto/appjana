import { useEffect,useState } from 'react';
import { NavLink,useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '../features/profile/hooks/use-profile';
import { ProfileEditor } from '../features/profile/components/ProfileEditor';
import { avatarSchema } from '../features/profile/profile.types';
import { signOut } from '../features/onboarding/services/auth.service';
import { useT } from '../lib/i18n/use-t';
import { QueryState } from '../components/shared/QueryState';
import { MapPage } from './MapPage';
import { WelcomeBubbles } from '../components/shared/WelcomeBubbles';
import { DocumentsPage } from './DocumentsPage';
import { CalendarPage } from './CalendarPage';
import { AssistantPage } from './AssistantPage';
const nav = [['/','map','⌁'],['/documents','documents','▤'],['/assistant','assistant','✧'],['/calendar','calendar','▦'],['/profile','profile','◉']] as const;
export function AppShell({userId}:{userId:string}) {
  const {t,language,setLanguage}=useT();
  const {profile,save}=useProfile(userId);
  const cache=useQueryClient();
  const location=useLocation();
  const [logoutError,setLogoutError]=useState(false);
  useEffect(()=>{ if(profile.data) setLanguage(profile.data.language==='en'?'en':'hr'); },[profile.data?.language,setLanguage,profile.data]);
  async function logout():Promise<void> { try { await signOut(); cache.clear(); } catch { setLogoutError(true); } }
  if (!profile.data) return <main className="app-shell"><QueryState loading={profile.isPending} error={profile.isError} retry={()=>void profile.refetch()}/><button onClick={logout}>{t.signOut}</button></main>;
  const data=profile.data;
  const editor=<ProfileEditor key={data.id} profile={data} onSave={input=>save.mutate(input)} pending={save.isPending} error={save.isError}/>;
  if(!data.display_name) return <main className="app-shell onboarding"><header><span className="wordmark">{t.brand}</span><button className="language" onClick={()=>setLanguage(language==='hr'?'en':'hr')}>{t.language}</button></header><h1>{t.profileIntro}</h1><p>{t.profileBody}</p>{editor}<button className="quiet" onClick={logout}>{t.signOut}</button></main>;
  let page=<MapPage profile={data}/>;
  if(location.pathname==='/documents') page=<DocumentsPage userId={userId}/>;
  if(location.pathname==='/calendar') page=<CalendarPage userId={userId}/>;
  if(location.pathname==='/assistant') page=<AssistantPage userId={userId} avatar={data.avatar_config}/>;
  if(location.pathname==='/profile') page=<section className="content-page"><h1>{data.display_name}</h1><div className="profile-stats"><span>{data.hp} {t.hp}</span><span>{data.streak_days} · {t.streak}</span></div><label>{t.language}<select value={data.language} disabled={save.isPending} onChange={event=>save.mutate({display_name:data.display_name,tone:data.tone as 'blago'|'sarkasticno'|'brutalno',language:event.target.value as 'hr'|'en',avatar_config:avatarSchema.parse(data.avatar_config)})}><option value="hr">{t.croatian}</option><option value="en">{t.english}</option></select></label>{editor}<button className="quiet" onClick={logout}>{t.signOut}</button>{logoutError&&<p role="alert">{t.authError}</p>}</section>;
  return <main className="app-shell"><header className="app-header"><NavLink to="/" className="wordmark">{t.brand}</NavLink><span>{data.display_name}</span></header>{page}<WelcomeBubbles/><nav className="bottom-nav" aria-label={t.navigation}>{nav.map(([path,label,icon])=><NavLink end={path==='/'} key={path} to={path}><span aria-hidden="true">{icon}</span><small>{t[label]}</small></NavLink>)}</nav></main>;
}
