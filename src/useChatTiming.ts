'use client';

import { useEffect, useState, type RefObject } from 'react';

const definitions = {
  charactersPerSecond: ['--cm-reveal-rate', 80, 1, 2000],
  maxTailMs: ['--cm-reveal-tail', 1200, 0, 6000],
  messageIntervalMs: ['--cm-waiting-message', 5000, 1000, 60000],
  variantIntervalMs: ['--cm-waiting-variant', 15000, 1000, 60000],
} as const;
type Timing = { [Key in keyof typeof definitions]: number };
const defaults: Timing = { charactersPerSecond: 80, maxTailMs: 1200, messageIntervalMs: 5000, variantIntervalMs: 15000 };

/** Read inherited timing tokens without requiring a provider. CSS/style/class theme switches work too. */
export function useChatTiming(ref: RefObject<HTMLElement | null>, mounted = true): Timing {
  const [timing, setTiming] = useState(defaults);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => {
      const style = getComputedStyle(element);
      const next = { ...defaults };
      for (const key of Object.keys(definitions) as (keyof Timing)[]) {
        const [name, fallback, min, max] = definitions[key];
        const raw = style.getPropertyValue(name).trim();
        const parsed = Number.parseFloat(raw) * (key !== 'charactersPerSecond' && raw.endsWith('s') && !raw.endsWith('ms') ? 1000 : 1);
        next[key] = Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
      }
      setTiming(previous => Object.keys(next).every(key => previous[key as keyof Timing] === next[key as keyof Timing]) ? previous : next);
    };
    update();
    const observer = typeof MutationObserver === 'undefined' ? null : new MutationObserver(update);
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      observer?.observe(node, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] });
    }
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, [ref, mounted]);
  return timing;
}
