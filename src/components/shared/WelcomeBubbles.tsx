import { useEffect,useState } from 'react';
import type { CSSProperties } from 'react';
export function WelcomeBubbles() {
  const [visible,setVisible]=useState(true);
  useEffect(()=>{const timer=setTimeout(()=>setVisible(false),2800);return()=>clearTimeout(timer);},[]);
  if(!visible)return null;
  return <div className="rg-welcome-bubbles" aria-hidden="true">{Array.from({length:52},(_,i)=>{
    const row=Math.floor(i/6),column=i%6;
    const style={'--bubble-x':`${7+column*17+Math.sin(i*3.7)*7}%`,'--bubble-y':`${7+row*11+Math.cos(i*2.3)*4}%`,'--bubble-size':`${i%13===0?142:30+(i*29)%76}px`,'--bubble-delay':`${Math.round((8-row)*65+(i%5)*70)}ms`,'--bubble-time':`${1450+(i%4)*110}ms`,'--bubble-drift':`${Math.sin(i*1.7)*44}px`,'--bubble-tilt':`${(i%5-2)*11}deg`} as CSSProperties;
    return <span className="rg-welcome-bubble" key={i} style={style}><i className="rg-welcome-bubble-skin"/></span>;
  })}</div>;
}
