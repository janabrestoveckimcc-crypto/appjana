import { useEffect,useRef,useState } from 'react';
import { useT } from '../../lib/i18n/use-t';
export function IntroScreen({onEnter}:{onEnter:()=>void}) {
  const {t}=useT();
  const [leaving,setLeaving]=useState(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function enter():void {
    if(leaving)return;
    setLeaving(true);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onEnter();return;}
    timer.current=setTimeout(onEnter,950);
  }
  return <main className="relai-entry"><section className={`rg-intro ${leaving?'is-leaving':''}`} aria-label={t.introWelcome}><div className="rg-intro-enter">
    <img className="rg-intro-image" src="/game/intro-v6.png" alt="" fetchPriority="high"/>
    <span className="rg-intro-haze" aria-hidden="true"/>
    <div className="rg-intro-title"><button className="rg-intro-logo-button" aria-label={t.introContinue} onClick={enter} disabled={leaving}><strong className="rg-animated-logo" aria-hidden="true">{'relAI'.split('').map((letter,index)=><span key={index}>{letter}</span>)}</strong></button><span className="rg-intro-subtitle">{t.introTaglineA}<br/>{t.introTaglineB}</span></div>
    <div className="rg-intro-hint">{t.tapLogo}<span>{t.firstStep}</span></div>
  </div></section></main>;
}
