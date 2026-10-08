import { useState } from 'react';
import { AuthForm } from '../features/onboarding/components/AuthForm';
import { useSession } from '../features/onboarding/hooks/use-session';
import { signOut } from '../features/onboarding/services/auth.service';
import { isBackendConfigured } from '../lib/supabase';
import { useT } from '../lib/i18n/use-t';
export function WelcomePage() {
  const { t, language, setLanguage } = useT();
  const { session, loading, failed, retry } = useSession();
  const [error, setError] = useState(false);
  async function logout(): Promise<void> { try { await signOut(); } catch { setError(true); } }
  let content = <AuthForm />;
  if (!isBackendConfigured) content = <section><span className="status-dot" /><h1>{t.setupTitle}</h1><p>{t.setupBody}</p><p className="setup-hint">{t.setupHint}</p></section>;
  else if (loading) content = <p role="status">{t.loading}</p>;
  else if (failed) content = <section><p role="alert">{t.sessionError}</p><button onClick={retry}>{t.retry}</button></section>;
  else if (session) content = <section><h1>{t.signedIn}</h1><p>{session.user.email}</p><p>{t.connected}</p><button onClick={logout}>{t.signOut}</button>{error && <p role="alert">{t.authError}</p>}</section>;
  return <main className="welcome"><header><span className="wordmark">{t.brand}</span><button className="language" onClick={() => setLanguage(language === 'hr' ? 'en' : 'hr')}>{t.language}</button></header><div className="brand-halo" aria-hidden="true"/><div className="welcome-card">{content}</div><footer>{t.tagline}</footer></main>;
}
