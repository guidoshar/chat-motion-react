'use client';

import { useSyncExternalStore } from 'react';

function subscribe(update: () => void) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const forced = window.matchMedia?.('(forced-colors: active)');
  reduced?.addEventListener('change', update);
  forced?.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  return () => {
    reduced?.removeEventListener('change', update);
    forced?.removeEventListener('change', update);
    document.removeEventListener('visibilitychange', update);
  };
}
const snapshot = () => document.hidden || Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  || Boolean(window.matchMedia?.('(forced-colors: active)').matches);
const serverSnapshot = () => true;

/** A static first SSR/hydration frame, followed by the reader's motion preferences. */
export function useMotionEnvironment() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
