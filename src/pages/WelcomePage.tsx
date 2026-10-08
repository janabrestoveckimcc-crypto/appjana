import { AuthForm } from '../features/onboarding/components/AuthForm';
import { useSession } from '../features/onboarding/hooks/use-session';
import { AppShell } from './AppShell';
import { isBackendConfigured } from '../lib/supabase';
import { useT } from '../lib/i18n/use-t';
export function WelcomePage() {
  const [entered,setEntered]=useState(false);
  const { t, language, setLanguage } = useT();
  const { session, loading, failed, retry } = useSession();
  if (!entered) return <IntroScreen onEnter={()=>setEntered(true)}/>;
  if (session) return <AppShell userId={session.user.id}/>;
  let content = <AuthForm />;
  if (!isBackendConfigured) content = <section><span className="status-dot" /><h1>{t.setupTitle}</h1><p>{t.setupBody}</p><p className="setup-hint">{t.setupHint}</p></section>;
  else if (loading) content = <p role="status">{t.loading}</p>;
  else if (failed) content = <section><p role="alert">{t.sessionError}</p><button onClick={retry}>{t.retry}</button></section>;
  return <main className="relai-entry auth-entry"><div className="rg-profile-dialog is-welcome"><header className="entry-brand-row"><span className="rg-profile-wordmark">rel<span>AI</span></span><button className="language" onClick={() => setLanguage(language === 'hr' ? 'en' : 'hr')}>{t.language}</button></header>{content}</div></main>;
}
import { useState } from 'react';
import { IntroScreen } from '../components/shared/IntroScreen';
