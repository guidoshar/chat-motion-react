import type { CSSProperties } from 'react';

/** UI approximation of the supplied multicolor brand mark, not official print specifications. */
export const spectrumPalette = ['#21A8BD', '#1775B9', '#76518C', '#DB3B49', '#F28B2C'] as const;
export type MotionPalette = readonly string[];
export type MotionStyle = CSSProperties & { [key: `--cm-${string}`]: string | number | undefined };

/** Numbers are CSS pixels, except speed (multiplier) and duration values (milliseconds). */
export interface MotionTokens {
  cyan?: string;
  blue?: string;
  violet?: string;
  red?: string;
  orange?: string;
  textColor?: string;
  mutedColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  successColor?: string;
  errorColor?: string;
  orbSize?: number;
  speed?: number;
  labelSize?: number;
  gap?: number;
  pillRadius?: number;
  cursorWidth?: number;
  cursorHeight?: string;
  cursorGap?: number;
  glyphFadeMs?: number;
  cursorCycleMs?: number;
  cursorSettleMs?: number;
}

const tokenMap = {
  cyan: ['--cm-cyan', ''], blue: ['--cm-blue', ''], violet: ['--cm-violet', ''],
  red: ['--cm-red', ''], orange: ['--cm-orange', ''],
  textColor: ['--cm-text', ''], mutedColor: ['--cm-muted', ''],
  surfaceColor: ['--cm-surface', ''], borderColor: ['--cm-border', ''],
  successColor: ['--cm-success', ''], errorColor: ['--cm-error', ''],
  orbSize: ['--cm-orb-size', 'px'], speed: ['--cm-speed', ''],
  labelSize: ['--cm-label-size', 'px'], gap: ['--cm-gap', 'px'],
  pillRadius: ['--cm-pill-radius', 'px'], cursorWidth: ['--cm-cursor-width', 'px'],
  cursorHeight: ['--cm-cursor-height', ''], cursorGap: ['--cm-cursor-gap', 'px'],
  glyphFadeMs: ['--cm-glyph-fade', 'ms'], cursorCycleMs: ['--cm-cursor-cycle', 'ms'],
  cursorSettleMs: ['--cm-cursor-settle', 'ms'],
} as const satisfies Record<keyof MotionTokens, readonly [string, string]>;

/** Usable on any host element, without a provider or a runtime theme dependency. */
export function motionTokens(tokens: MotionTokens = {}): MotionStyle {
  const style: Record<string, string> = {};
  for (const key of Object.keys(tokens) as (keyof MotionTokens)[]) {
    const value = tokens[key];
    if (value === undefined || (typeof value === 'number' && !Number.isFinite(value))) continue;
    const [property, unit] = tokenMap[key];
    style[property] = `${value}${typeof value === 'number' ? unit : ''}`;
  }
  return style as MotionStyle;
}

export const darkTokens = {
  textColor: '#D3E6F6', mutedColor: '#A2B6C8', surfaceColor: '#182635',
  borderColor: '#2B4055', successColor: '#78C7B3', errorColor: '#F5A0A8',
} satisfies MotionTokens;
