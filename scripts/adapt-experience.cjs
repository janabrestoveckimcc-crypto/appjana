const fs=require('node:fs');
function edit(path,changes){let s=fs.readFileSync(path,'utf8');for(const [a,b] of changes){if(!s.includes(a))throw Error(path+': missing '+a);s=s.replace(a,b);}fs.writeFileSync(path,s);}
edit('experience/ui/mount.js',[
 ['mountFutureSelf(host, signal)','mountFutureSelf(host, signal, integration = {})'],
 ['const storage=createDemoStorage(defaults);',`const seed=()=>{const value=defaults();if(integration.userId){value.tasks=[];value.profile=integration.profile||null;value.avatar={...value.avatar,...integration.avatar};value.prefs.language=integration.language||'hr';}return value;};
const storage=createDemoStorage(seed,integration.userId?'relai-experience-'+integration.userId:undefined);`],
 ['const saved=storage.save(clean);','const saved=storage.save(clean);integration.onPersist?.({profile:state.profile,avatar:state.avatar,prefs:state.prefs});'],
 ['createProfileUX({root,getState:()=>state,persist,render,icon,esc,signal})','createProfileUX({root,getState:()=>state,persist,render,icon,esc,signal,authenticated:!!integration.userId})'],
 ['mountMysticIntro({root,signal,onEnter:()=>profile.openWelcome()});',`mountMysticIntro({root,signal,onEnter:()=>profile.openWelcome(),skipInitial:!!integration.userId});
if(integration.userId){if(state.profile?.username)root.dispatchEvent(new CustomEvent('relai:profile-saved',{detail:{welcome:true}}));else profile.openWelcome();}`],
]);
edit('experience/profile.js',[
 ['icon,esc,signal})','icon,esc,signal,authenticated=false})'],
 ["${welcome?passwordField('password'","${welcome&&!authenticated?passwordField('password'"],
 ['rememberMe:f.rememberMe.checked','rememberMe:f.rememberMe?.checked??s.prefs.rememberMe'],
]);
