'use client';

import { useEffect, useState, type RefObject } from 'react';

/** No animation loop. Coordinate CSS treatments with visibility and user preferences. */
export function useMotionActivity(ref: RefObject<HTMLElement | null>, paused: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forced = window.matchMedia('(forced-colors: active)');
    let inView = true;
    const sync = () => setActive(!document.hidden && !reduced.matches && !forced.matches && inView);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? false;
      sync();
    });
    observer?.observe(element);
    reduced.addEventListener('change', sync);
    forced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      observer?.disconnect();
      reduced.removeEventListener('change', sync);
      forced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [ref]);
  return active && !paused;
}
