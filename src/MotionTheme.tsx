'use client';

import type { HTMLAttributes } from 'react';
import { motionTokens, type MotionTokens, type MotionStyle } from './tokens.js';

export interface MotionThemeProps extends HTMLAttributes<HTMLDivElement> {
  tokens?: MotionTokens;
  style?: MotionStyle;
}

/** An optional CSS-variable scope. It makes no network calls and needs no context provider. */
export function MotionTheme({ tokens, style, children, ...props }: MotionThemeProps) {
  return <div {...props} style={{ ...motionTokens(tokens), ...style }}>{children}</div>;
}
