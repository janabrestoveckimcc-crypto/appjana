import type { Session, Subscription } from '@supabase/supabase-js';
import { getSupabase } from '../../../lib/supabase';

export async function readSession(): Promise<Session | null> {
  const { data, error } = await getSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}
export function observeSession(callback: (session: Session | null) => void): Subscription {
  return getSupabase().auth.onAuthStateChange((_event, session) => callback(session)).data.subscription;
}
export async function signIn(input: { email: string; password: string }): Promise<void> {
  const { error } = await getSupabase().auth.signInWithPassword(input);
  if (error) throw error;
}
export async function signUp(input: { email: string; password: string }): Promise<boolean> {
  const { data, error } = await getSupabase().auth.signUp({
    ...input,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
  return !data.session;
}
export async function signOut(): Promise<void> {
  // Stop delivery to a shared device before ending its authenticated session.
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager?.getSubscription();
    if (subscription) {
      const {data} = await getSupabase().auth.getUser();
      if (data.user) {
        const {error} = await getSupabase().from('push_subscriptions').delete().eq('endpoint', subscription.endpoint).eq('user_id', data.user.id);
        if (error) throw error;
      }
      await subscription.unsubscribe();
    }
  }
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}
