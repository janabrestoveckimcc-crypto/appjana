import { Link } from 'react-router';
import type { Profile } from '../features/profile/profile.types';
import { useT } from '../lib/i18n/use-t';
import { Avatar } from '../components/shared/Avatar';
const stops = [[52,85],[33,76],[53,67],[73,59],[53,51],[30,45],[48,35],[69,28],[51,19],[39,10]];
export function MapPage({profile}:{profile:Profile}) {
  const {t}=useT();
  const field=Math.min(9,Math.floor(profile.hp/10));
  const [left,top]=stops[field];
  return <section className="map-page"><div className="map-title"><span>{t.stepByStep}</span><strong>{profile.hp}<small> / 100 {t.hp}</small></strong></div>
    <div className="world"><img className="map-art" src="/game/path-v6.png" alt=""/><svg className="map-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={stops.map(([x,y])=>`${x},${y}`).join(' ')} /></svg>
    {stops.map(([x,y],index)=><span className={`map-stop ${index<field?'completed':''} ${index===field?'current':''}`} style={{left:`${x}%`,top:`${y}%`}} key={index}>{index+1}</span>)}
    <div className="map-person" style={{left:`${left}%`,top:`${top}%`}}><Avatar config={profile.avatar_config} presence={profile.presence}/></div>
    <div className="map-caption"><small>{t.currentMap}</small><h1>{t.mapNames.split('|')[Math.min(profile.map_index-1,4)]}</h1><Link to="/calendar">{t.viewCalendar} ↗</Link></div></div>
  </section>;
}
