import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { observeSession, readSession } from '../services/auth.service';
import { isBackendConfigured } from '../../../lib/supabase';
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isBackendConfigured);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!isBackendConfigured) return;
    let active = true;
    const subscription = observeSession((next) => { if (active) { setSession(next); setLoading(false); } });
    readSession().then((next) => { if (active) setSession(next); })
      .catch(() => { if (active) setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; subscription.unsubscribe(); };
  }, [attempt]);
  return { session, loading, failed, retry: () => { setFailed(false); setLoading(true); setAttempt(attempt + 1); } };
}
