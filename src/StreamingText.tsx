'use client';

import { useEffect, useMemo, useState } from 'react';
import { motionTokens, type MotionTokens, type MotionStyle } from './tokens.js';

export interface StreamingTextProps {
  /** Full accumulated text, not the latest delta. Rendered as text, never HTML. */
  text: string;
  /** settled fades out the cursor; idle renders history with no cursor. */
  phase?: 'writing' | 'settled' | 'idle';
  paused?: boolean;
  tokens?: MotionTokens;
  style?: MotionStyle;
  className?: string;
}

const segmenter = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('zh-CN', { granularity: 'grapheme' }) : null;

/** Presentation only. The caller owns SSE transport, server content and stream lifetime. */
export function StreamingText({ text, phase = 'writing', paused = false, tokens, style, className = '' }: StreamingTextProps) {
  // Keep the server and the first client render identical. No document access during render.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const sync = () => setHidden(document.hidden);
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  const { prefix, tail, start } = useMemo(() => {
    if (phase !== 'writing') return { prefix: text, tail: [] as string[], start: 0 };
    const glyphs = segmenter ? Array.from(segmenter.segment(text), part => part.segment) : Array.from(text);
    const start = Math.max(0, glyphs.length - 24);
    return { prefix: glyphs.slice(0, start).join(''), tail: glyphs.slice(start), start };
  }, [text, phase]);

  return <span className={`cm-stream ${className}`} data-phase={phase} data-motion-paused={paused || hidden}
    style={{ ...motionTokens(tokens), ...style }}>
    {prefix}{tail.map((glyph, index) => <span className="cm-stream-glyph" key={`${start + index}:${glyph}`}>{glyph}</span>)}
    {phase !== 'idle' && <span className="cm-stream-caret" aria-hidden="true"><i/></span>}
  </span>;
}
