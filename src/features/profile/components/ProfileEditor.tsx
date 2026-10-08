import { useState } from 'react';
import { Avatar } from '../../../components/shared/Avatar';
import { useT } from '../../../lib/i18n/use-t';
import { avatarSchema, profileSchema } from '../profile.types';
import type { Profile, ProfileInput } from '../profile.types';
export function ProfileEditor({ profile, onSave, pending, error }: {
  profile: Profile; onSave: (input: ProfileInput) => void; pending: boolean; error: boolean;
}) {
  const { t, language } = useT();
  const [name,setName] = useState(profile.display_name);
  const [tone,setTone] = useState(profile.tone);
  const parsed = avatarSchema.safeParse(profile.avatar_config);
  const [avatar,setAvatar] = useState(parsed.success ? parsed.data : avatarSchema.parse({}));
  const [invalid,setInvalid] = useState(false);
  const [saved,setSaved] = useState(false);
  function submit(event: React.FormEvent): void {
    event.preventDefault();
    const result = profileSchema.safeParse({display_name:name,tone,language,avatar_config:avatar});
    setInvalid(!result.success);
    if (result.success) { onSave(result.data); setSaved(true); }
  }
  return <form className="profile-editor" onSubmit={submit}>
    <div className="avatar-stage"><Avatar config={avatar} presence={profile.presence}/></div>
    <label>{t.displayName}<input value={name} maxLength={80} required onChange={(event)=>setName(event.target.value)} autoComplete="nickname"/></label>
    <label>{t.tone}<select value={tone} onChange={(event)=>setTone(event.target.value)}><option value="blago">{t.gentle}</option><option value="sarkasticno">{t.sarcastic}</option><option value="brutalno">{t.brutal}</option></select></label>
    <p className="field-note">{t.toneHint}</p>
    <div className="form-row"><label>{t.gender}<select value={avatar.gender} onChange={(event)=>setAvatar({...avatar,gender:event.target.value as 'male'|'female'})}><option value="female">{t.female}</option><option value="male">{t.male}</option></select></label>
    <label>{t.height}<select value={avatar.height} onChange={(event)=>setAvatar({...avatar,height:event.target.value as 'short'|'medium'|'tall'})}><option value="short">{t.short}</option><option value="medium">{t.medium}</option><option value="tall">{t.tall}</option></select></label></div>
    <label>{t.build}<select value={avatar.build} onChange={(event)=>setAvatar({...avatar,build:event.target.value as 'slim'|'medium'|'strong'})}><option value="slim">{t.slim}</option><option value="medium">{t.medium}</option><option value="strong">{t.strong}</option></select></label>
    {(error || invalid) && <p role="alert">{t.saveError}</p>}
    {saved && !pending && !error && <p role="status">{t.saved}</p>}
    <button className="primary" disabled={pending}>{pending ? t.loading : t.saveProfile}</button>
  </form>;
}
