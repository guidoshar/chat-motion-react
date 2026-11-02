'use client';

import { useEffect, useRef, useState } from 'react';
import { ThinkingOrb, type ThinkingOrbProps } from './ThinkingOrb.js';
import { motionTokens } from './tokens.js';
import { useMotionEnvironment } from './useMotionEnvironment.js';

/** A bounded two-layer dissolve between the five existing particle geometries. */
export function TransitionOrb({ variant = 'band', className = '', tokens, style, label, ...props }: ThinkingOrbProps) {
  const quiet = useMotionEnvironment();
  const host = useRef<HTMLSpanElement>(null);
  const [layers, setLayers] = useState({ current: variant, previous: variant });
  if (layers.current !== variant) setLayers({ current: variant, previous: layers.current });
  const changing = layers.previous !== layers.current && !quiet && !props.paused;
  useEffect(() => {
    if (layers.previous === layers.current) return;
    const raw = host.current ? getComputedStyle(host.current).getPropertyValue('--cm-orb-transition').trim() : '';
    const parsed = Number.parseFloat(raw) * (raw.endsWith('ms') ? 1 : raw.endsWith('s') ? 1000 : 1);
    const duration = Number.isFinite(parsed) ? Math.max(0, Math.min(3000, parsed)) : 1200;
    const timer = window.setTimeout(() => setLayers(value => ({ ...value, previous: value.current })), changing ? duration : 0);
    return () => window.clearTimeout(timer);
  }, [changing, layers]);
  return <span ref={host} className={`cm-transition-orb ${className}`} data-transitioning={changing}
    style={{ ...motionTokens(tokens), ...style }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    {changing && <span className="cm-transition-orb-outgoing" key={layers.previous}><ThinkingOrb {...props} variant={layers.previous} /></span>}
    <span className="cm-transition-orb-current" key={layers.current}><ThinkingOrb {...props} variant={layers.current} /></span>
  </span>;
}
