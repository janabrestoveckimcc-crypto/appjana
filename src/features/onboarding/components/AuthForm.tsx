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
  const [visible,setVisible]=useState(false);
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
  return <form className="rg-profile-form" onSubmit={handleSubmit(submit)}>
    <div className="rg-profile-dialog-header"><span className="rg-profile-eyebrow">{t.newBeginning}</span><h1>{t.startWithYou}</h1><p>{t.futureIsHere}</p></div>
    <label className="rg-profile-field"><span>{t.email}</span><input type="email" autoComplete="email" placeholder={t.emailPlaceholder} required {...register('email')} /></label>
    <label className="rg-profile-field"><span>{t.password}</span><span className="rg-profile-password"><input type={visible?'text':'password'} autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering?t.passwordPlaceholder:undefined} minLength={registering ? 8 : 1} maxLength={128} required {...register('password')} /><button type="button" aria-label={visible?t.hidePassword:t.showPassword} aria-pressed={visible} onClick={()=>setVisible(!visible)}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></span></label>
    {message && <p role="status">{message}</p>}
    <button className="rg-profile-primary" disabled={isSubmitting}>{isSubmitting ? t.loading : registering ? t.signUp : t.signIn}<span aria-hidden="true">→</span></button>
    <button type="button" className="quiet" disabled={isSubmitting} onClick={() => { setRegistering(!registering); setMessage(''); }}>{registering ? t.haveAccount : t.needAccount} {registering ? t.signIn : t.signUp}</button>
  </form>;
}
