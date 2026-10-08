import type { CSSProperties } from 'react';
import type { Json } from '../../lib/database.types';
export function Avatar({ config, presence = 100 }: { config: Json; presence?: number }) {
  const values = config && typeof config === 'object' && !Array.isArray(config) ? config : {};
  const gender = values.gender === 'male' ? 'male' : 'female';
  const heights: Record<string, number> = { short:.92,medium:1,tall:1.08 };
  const builds: Record<string, number> = { slim:.92,medium:1,strong:1.1 };
  const style = {
    '--avatar-height': heights[String(values.height)] ?? 1,
    '--avatar-width': builds[String(values.build)] ?? 1,
    opacity: .25 + .75 * Math.max(0,Math.min(100,presence))/100,
  } as CSSProperties;
  return <span className={`human-avatar ${presence < 30 ? 'fading' : ''}`} style={style} aria-hidden="true"><img src={`/game/avatar-${gender}-v4.png`} alt="" draggable={false}/></span>;
}
