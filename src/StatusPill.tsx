'use client';

import { forwardRef } from 'react';
import { ThinkingOrb } from './ThinkingOrb.js';
import { TransitionOrb } from './TransitionOrb.js';
import { useMotionEnvironment } from './useMotionEnvironment.js';
import type { OrbVariant, OrbColorMode } from './orbGeometry.js';
import { motionTokens, type MotionPalette, type MotionTokens, type MotionStyle } from './tokens.js';

export type MotionStatus = 'running' | 'success' | 'error' | 'idle';
export interface StatusPillProps {
  label: string;
  variant?: OrbVariant;
  colorMode?: OrbColorMode;
  density?: number;
  dotScale?: number;
  status?: MotionStatus;
  size?: 'sm' | 'md' | 'lg';
  /** Plain (unboxed) by default. */
  appearance?: 'soft' | 'plain';
  paused?: boolean;
  speed?: number;
  palette?: MotionPalette;
  tokens?: MotionTokens;
  style?: MotionStyle;
  className?: string;
  /** Enable once per live region, not on every nested status. */
  announce?: boolean;
  /** Opt-in dissolve when variant changes. */
  transition?: boolean;
  /** Subtle token-colored text sheen, disabled when motion is paused. */
  animatedLabel?: boolean;
}

export const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(function StatusPill({ label, variant = 'band', colorMode, density, dotScale, status = 'running', size = 'md', appearance = 'plain', paused = false, speed, palette, tokens, style, className = '', announce = false, transition = false, animatedLabel = false }, ref) {
  const quiet = useMotionEnvironment();
  const Orb = transition ? TransitionOrb : ThinkingOrb;
  return <span ref={ref} className={`cm-status ${className}`} data-status={status} data-size={size} data-appearance={appearance}
    data-motion-paused={paused || quiet} data-animated-label={animatedLabel && status === 'running'}
    style={{ ...motionTokens(tokens), ...style }} role={announce ? 'status' : undefined}
    aria-live={announce ? 'polite' : undefined} aria-atomic={announce ? true : undefined}>
    {status === 'success' || status === 'error'
      ? <span className="cm-status-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/>{status === 'success' ? <path d="m8 12 2.7 2.7L16 9"/> : <path d="M12 7.5v5M12 16h.01"/>}</svg></span>
      : <Orb variant={variant} colorMode={colorMode} density={density} dotScale={dotScale} paused={paused || status === 'idle'} speed={speed} palette={palette}/>}
    <span className="cm-status-label"><span className="cm-status-copy" key={label}>{label}</span></span>
  </span>;
});
