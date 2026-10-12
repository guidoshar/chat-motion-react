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
  const { prefix, tail } = useMemo(() => {
    if (phase !== 'writing') return { prefix: text, tail: [] as { glyph: string; offset: number }[] };
    // Segment only the trailing window; keep absolute UTF-16 keys so incoming
    // deltas do not replay animations on existing text. Never truncate the reply.
    let boundary = Math.max(0, text.length - 2048);
    if (segmenter) boundary = segmenter.segment(text).containing(boundary)?.index ?? 0;
    else if (boundary > 0 && /[\uDC00-\uDFFF]/.test(text[boundary])) boundary--;
    const suffix = text.slice(boundary);
    const glyphs = segmenter ? Array.from(segmenter.segment(suffix), part => part.segment) : Array.from(suffix);
    const start = Math.max(0, glyphs.length - 24);
    const prefix = text.slice(0, boundary) + glyphs.slice(0, start).join('');
    let offset = prefix.length;
    const tail = glyphs.slice(start).map(glyph => {
      const entry = { glyph, offset };
      offset += glyph.length;
      return entry;
    });
    return { prefix, tail };
  }, [text, phase]);

  return <span className={`cm-stream ${className}`} data-phase={phase} data-motion-paused={paused || hidden}
    style={{ ...motionTokens(tokens), ...style }}>
    {prefix}{tail.map(({ glyph, offset }) => <span className="cm-stream-glyph" key={`${offset}:${glyph}`}>{glyph}</span>)}
    {phase !== 'idle' && <span className="cm-stream-caret" aria-hidden="true"><i/></span>}
  </span>;
}
