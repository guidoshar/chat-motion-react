'use client';

import { ThinkingOrb } from './ThinkingOrb.js';
import type { OrbVariant } from './orbGeometry.js';
import { motionTokens, type MotionPalette, type MotionTokens, type MotionStyle } from './tokens.js';

export type MotionStatus = 'running' | 'success' | 'error' | 'idle';
export interface StatusPillProps {
  label: string;
  variant?: OrbVariant;
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
}

export function StatusPill({ label, variant = 'band', status = 'running', size = 'md', appearance = 'plain', paused = false, speed, palette, tokens, style, className = '', announce = false }: StatusPillProps) {
  return <span className={`cm-status ${className}`} data-status={status} data-size={size} data-appearance={appearance}
    data-motion-paused={paused}
    style={{ ...motionTokens(tokens), ...style }} role={announce ? 'status' : undefined}
    aria-live={announce ? 'polite' : undefined} aria-atomic={announce ? true : undefined}>
    {status === 'success' || status === 'error'
      ? <span className="cm-status-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/>{status === 'success' ? <path d="m8 12 2.7 2.7L16 9"/> : <path d="M12 7.5v5M12 16h.01"/>}</svg></span>
      : <ThinkingOrb variant={variant} paused={paused || status === 'idle'} speed={speed} palette={palette}/>}
    <span className="cm-status-label"><span className="cm-status-copy" key={label}>{label}</span></span>
  </span>;
}
