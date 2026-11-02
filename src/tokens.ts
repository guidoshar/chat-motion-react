import type { CSSProperties } from 'react';

/** Original multicolor default; applications can supply their own semantic accent. */
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
  /** Neutral particle ink in six-digit HEX; defaults to the surrounding text color. */
  orbInk?: string;
  textColor?: string;
  mutedColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  successColor?: string;
  errorColor?: string;
  accentColor?: string;
  highlightColor?: string;
  subtleColor?: string;
  linkColor?: string;
  codeBackgroundColor?: string;
  codeTextColor?: string;
  panelRadius?: number;
  panelPadding?: number;
  responseFontSize?: number;
  responseLineHeight?: number;
  orbTransitionMs?: number;
  collapseMs?: number;
  expandMs?: number;
  sheenCycleMs?: number;
  orbSize?: number;
  speed?: number;
  /** Bounded multipliers, not absolute particle counts. */
  density?: number;
  dotScale?: number;
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
  orbInk: ['--cm-orb-ink', ''],
  textColor: ['--cm-text', ''], mutedColor: ['--cm-muted', ''],
  surfaceColor: ['--cm-surface', ''], borderColor: ['--cm-border', ''],
  successColor: ['--cm-success', ''], errorColor: ['--cm-error', ''],
  accentColor: ['--cm-accent', ''], highlightColor: ['--cm-highlight', ''],
  subtleColor: ['--cm-subtle', ''], linkColor: ['--cm-link', ''],
  codeBackgroundColor: ['--cm-code-background', ''], codeTextColor: ['--cm-code-text', ''],
  panelRadius: ['--cm-panel-radius', 'px'], panelPadding: ['--cm-panel-padding', 'px'],
  responseFontSize: ['--cm-response-font-size', 'px'], responseLineHeight: ['--cm-response-line-height', ''],
  orbTransitionMs: ['--cm-orb-transition', 'ms'], collapseMs: ['--cm-collapse', 'ms'],
  expandMs: ['--cm-expand', 'ms'], sheenCycleMs: ['--cm-sheen-cycle', 'ms'],
  orbSize: ['--cm-orb-size', 'px'], speed: ['--cm-speed', ''],
  density: ['--cm-density', ''], dotScale: ['--cm-dot-scale', ''],
  labelSize: ['--cm-label-size', 'px'], gap: ['--cm-gap', 'px'],
  pillRadius: ['--cm-pill-radius', 'px'], cursorWidth: ['--cm-cursor-width', 'px'],
  cursorHeight: ['--cm-cursor-height', ''], cursorGap: ['--cm-cursor-gap', 'px'],
  glyphFadeMs: ['--cm-glyph-fade', 'ms'], cursorCycleMs: ['--cm-cursor-cycle', 'ms'],
  cursorSettleMs: ['--cm-cursor-settle', 'ms'],
} as const satisfies Record<keyof MotionTokens, readonly [string, string]>;

const bounds: Partial<Record<keyof MotionTokens, readonly [number, number]>> = {
  orbSize: [16, 192], speed: [0, 3], density: [.5, 1.5], dotScale: [.5, 2],
  labelSize: [8, 48], gap: [0, 48], pillRadius: [0, 999],
  cursorWidth: [1, 8], cursorGap: [0, 24], glyphFadeMs: [0, 2000],
  cursorCycleMs: [500, 10000], cursorSettleMs: [0, 2000],
  panelRadius: [0, 40], panelPadding: [0, 48], responseFontSize: [12, 32], responseLineHeight: [1, 2.5],
  orbTransitionMs: [0, 3000], collapseMs: [0, 3000], expandMs: [0, 3000], sheenCycleMs: [500, 10000],
};

/** Usable on any host element, without a provider or a runtime theme dependency. */
export function motionTokens(tokens: MotionTokens = {}): MotionStyle {
  const style: Record<string, string> = {};
  if (!tokens || typeof tokens !== 'object' || Array.isArray(tokens)) return style;
  for (const key of Object.keys(tokens) as (keyof MotionTokens)[]) {
    if (!Object.hasOwn(tokenMap, key)) continue;
    let value = tokens[key];
    const range = bounds[key];
    if (range) {
      if (typeof value !== 'number' || !Number.isFinite(value)) continue;
      value = Math.max(range[0], Math.min(range[1], value));
    } else {
      if (typeof value !== 'string' || value.length > 128 || /url\s*\(|expression\s*\(|@import|[;{}<>]/i.test(value)) continue;
      if (['cyan', 'blue', 'violet', 'red', 'orange', 'orbInk'].includes(key) && !/^#[\da-f]{6}$/i.test(value)) continue;
      if (key === 'cursorHeight' && !/^(?:\d+|\d*\.\d+)(?:px|em|rem|%)$/.test(value)) continue;
    }
    const [property, unit] = tokenMap[key];
    style[property] = `${value}${typeof value === 'number' ? unit : ''}`;
  }
  return style as MotionStyle;
}

export const darkTokens = {
  orbInk: '#D3DCE7',
  textColor: '#D3E6F6', mutedColor: '#A2B6C8', surfaceColor: '#182635',
  borderColor: '#2B4055', successColor: '#78C7B3', errorColor: '#F5A0A8',
} satisfies MotionTokens;

/** One six-digit accent generates coordinated canvas, cursor, panel and text colors.
 * Overrides are still validated by motionTokens at the component boundary. */
export function createMotionTokens(accent: string, overrides: MotionTokens = {}): MotionTokens {
  if (!/^#[\da-f]{6}$/i.test(accent)) throw new TypeError('Accent must be a six-digit hex color.');
  const mix = (toward: number, amount: number) => '#' + [1, 3, 5].map(index =>
    Math.round(parseInt(accent.slice(index, index + 2), 16) * (1 - amount) + toward * amount).toString(16).padStart(2, '0')).join('');
  return {
    cyan: accent, blue: mix(0, .12), violet: mix(0, .24), red: mix(255, .2), orange: mix(255, .4),
    accentColor: accent, highlightColor: mix(255, .72), subtleColor: mix(255, .95), linkColor: mix(0, .28),
    textColor: '#20262e', mutedColor: '#647080', surfaceColor: '#ffffff', borderColor: '#dfe4eb',
    codeBackgroundColor: '#f1f4f8', codeTextColor: '#263347',
    ...overrides,
  };
}
