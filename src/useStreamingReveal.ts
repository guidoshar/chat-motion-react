'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionEnvironment } from './useMotionEnvironment.js';

export interface StreamingRevealOptions {
  /** Change for each new response; transport ownership stays in the application. */
  id?: string;
  text: string;
  complete?: boolean;
  historical?: boolean;
  interrupted?: boolean;
  /** Optional pacing, never delays receiving or saving network content. */
  enabled?: boolean;
  charactersPerSecond?: number;
  /** Maximum extra presentation time after transport completion. */
  maxTailMs?: number;
}
const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
const bounded = (value: number, fallback: number, min: number, max: number) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;

export function useStreamingReveal({ id = 'default', text, complete = false, historical = false, interrupted = false,
  enabled = true, charactersPerSecond = 80, maxTailMs = 1200 }: StreamingRevealOptions) {
  const quiet = useMotionEnvironment();
  const immediate = !enabled || quiet || historical || interrupted;
  const [cursor, setCursor] = useState({ id, text: immediate ? text : '' });
  const deadline = useRef(0);
  const input = useRef({ text, complete, charactersPerSecond, maxTailMs });
  // Effect events are intentionally avoided for React 18 compatibility.
  useEffect(() => { input.current = { text, complete, charactersPerSecond, maxTailMs }; });
  if (cursor.id !== id || !text.startsWith(cursor.text)) {
    setCursor({ id, text: immediate ? text : '' });
    deadline.current = 0;
  } else if (immediate && cursor.text !== text) {
    setCursor({ id, text });
    deadline.current = 0;
  }
  const visible = immediate ? text : cursor.id === id && text.startsWith(cursor.text) ? cursor.text : '';
  const pending = !immediate && visible !== text;
  useEffect(() => {
    deadline.current = 0;
    if (!pending) return;
    const timer = window.setInterval(() => {
      const next = input.current;
      const now = Date.now();
      if (next.complete && !deadline.current) deadline.current = now + bounded(next.maxTailMs, 1200, 0, 6000);
      setCursor(previous => {
        const prefix = next.text.startsWith(previous.text) ? previous.text : '';
        if (next.complete && now >= deadline.current) return { id, text: next.text };
        const increment = Math.max(1, Math.ceil(bounded(next.charactersPerSecond, 80, 1, 2000) * .04),
          next.complete ? Math.ceil((next.text.length - prefix.length) * 40 / Math.max(40, deadline.current - now)) : 0);
        const target = Math.min(next.text.length, prefix.length + increment);
        const segment = segmenter?.segment(next.text).containing(Math.max(0, target - 1));
        let end = segment ? segment.index + segment.segment.length : target;
        if (!segmenter && /[\uDC00-\uDFFF]/.test(next.text[end] ?? '')) end++;
        return { id, text: next.text.slice(0, end) };
      });
    }, 40);
    return () => window.clearInterval(timer);
  }, [pending, id]);
  return { text: visible, pending, complete: complete && !pending };
}
