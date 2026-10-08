import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signIn, signUp } from '../services/auth.service';
import { useT } from '../../../lib/i18n/use-t';
const credentials = z.object({ email: z.email(), password: z.string().min(8).max(128) });
type Credentials = z.infer<typeof credentials>;
export function AuthForm() {
  const { t } = useT();
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Credentials>();
  async function submit(input: Credentials): Promise<void> {
    setMessage('');
    try {
      const parsed = registering ? credentials.parse(input) : { email: z.email().parse(input.email), password: input.password };
      if (!registering) { await signIn(parsed); return; }
      if (await signUp(parsed)) setMessage(t.confirmEmail);
    } catch { setMessage(registering ? t.signupError : t.authError); }
  }
  return <form onSubmit={handleSubmit(submit)}>
    <h1>{registering ? t.signUp : t.welcome}</h1><p>{t.intro}</p>
    <label>{t.email}<input type="email" autoComplete="email" required {...register('email')} /></label>
    <label>{t.password}<input type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 8 : 1} maxLength={128} required {...register('password')} /></label>
    {message && <p role="status">{message}</p>}
    <button className="primary" disabled={isSubmitting}>{isSubmitting ? t.loading : registering ? t.signUp : t.signIn}</button>
    <button type="button" className="quiet" disabled={isSubmitting} onClick={() => { setRegistering(!registering); setMessage(''); }}>{registering ? t.haveAccount : t.needAccount} {registering ? t.signIn : t.signUp}</button>
  </form>;
}
