import {mountFutureSelf} from './ui/mount.js';
import {setProofNamespace} from './evidence.js';
import './styles.css';
import './additions.css';
import './documents.css';
import './brand.css';
import './game.css';
import './mystic.css';
import './warmth.css';
import './map-interactions.css';
import './profile.css';
import './task-views.css';
import './preferences.css';
import './light-theme.css';
import './categories.css';
import './welcome-bubbles.css';
import './language.css';
import './social.css';
const abort=new AbortController();
let mounted=false;
async function start(integration={}){
 if(mounted)return;mounted=true;
 if(integration.userId)setProofNamespace(integration.userId);
 try{await mountFutureSelf(document.getElementById('root'),abort.signal,integration);}
 catch(error){document.getElementById('root').textContent='relAI: '+error.message;}
}
window.addEventListener('pagehide',()=>abort.abort(),{once:true});
if(window.parent!==window){
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent)return;
  if(event.data?.type==='relai:init'&&typeof event.data.userId==='string'){
   start({...event.data,onPush:()=>parent.postMessage({type:'relai:push'},location.origin),onLogout:()=>parent.postMessage({type:'relai:logout'},location.origin),onPersist:state=>parent.postMessage({type:'relai:profile',state},location.origin)});
  }
 });
 parent.postMessage({type:'relai:ready'},location.origin);
}else{
 // Standalone approved UX preview, retaining the original explicit demo labels.
 start();
}
import './responsive.css';
