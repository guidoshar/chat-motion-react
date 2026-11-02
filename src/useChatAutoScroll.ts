'use client';

import { createContext, useCallback, useEffect, useLayoutEffect, useRef, useState,
  type KeyboardEvent, type TouchEvent, type WheelEvent } from 'react';

// Progress disclosures use the same reading-intent boundary as the scroll viewport.
export const ChatScrollPauseContext = createContext<() => void>(() => {});
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface ChatAutoScrollOptions {
  /** Change only for a new user submission, not for every streamed delta. */
  followKey?: unknown;
  /** Distance from the bottom at which downward scrolling resumes following. */
  bottomThreshold?: number;
}

/** Resize-aware following. Reading, text selection and process inspection take priority. */
export function useChatAutoScroll(changes?: unknown, { followKey, bottomThreshold = 2 }: ChatAutoScrollOptions = {}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const following = useRef(true);
  const [isFollowing, setIsFollowing] = useState(true);
  const lastTop = useRef(0);
  const touchY = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const previousKey = useRef(followKey);
  const threshold = Number.isFinite(bottomThreshold) ? Math.max(0, Math.min(100, bottomThreshold)) : 2;
  const setFollowing = useCallback((value: boolean) => {
    following.current = value;
    setIsFollowing(value);
    if (scrollRef.current) scrollRef.current.dataset.following = String(value);
  }, []);
  const pauseFollowing = useCallback(() => {
    setFollowing(false);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, [setFollowing]);
  const scheduleFollow = useCallback(() => {
    if (!following.current || frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      const element = scrollRef.current;
      if (!element || !following.current) return;
      const bottom = Math.max(0, element.scrollHeight - element.clientHeight);
      if (Math.abs(element.scrollTop - bottom) > 1) element.scrollTop = bottom;
      lastTop.current = element.scrollTop;
    });
  }, []);
  const follow = useCallback(() => { setFollowing(true); scheduleFollow(); }, [setFollowing, scheduleFollow]);
  useClientLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.dataset.following = String(following.current);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleFollow);
    observer?.observe(element);
    if (contentRef.current) observer?.observe(contentRef.current);
    return () => {
      observer?.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [scheduleFollow]);
  useClientLayoutEffect(() => { scheduleFollow(); }, [changes, scheduleFollow]);
  useClientLayoutEffect(() => {
    if (Object.is(previousKey.current, followKey)) return;
    previousKey.current = followKey;
    follow();
  }, [followKey, follow]);
  const atBottom = (element: HTMLDivElement) => element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
  return {
    scrollRef, contentRef, isFollowing, pauseFollowing, follow,
    onScroll: () => {
      const element = scrollRef.current;
      if (!element) return;
      const top = element.scrollTop;
      if (top < lastTop.current && !atBottom(element)) pauseFollowing();
      else if (top > lastTop.current && atBottom(element)) setFollowing(true);
      lastTop.current = top;
    },
    onWheel: (event: WheelEvent<HTMLDivElement>) => {
      if (event.deltaY < 0) pauseFollowing();
      const element = scrollRef.current;
      if (event.deltaY > 0 && element && atBottom(element)) follow();
    },
    onPointerDown: pauseFollowing,
    onTouchStart: (event: TouchEvent<HTMLDivElement>) => { touchY.current = event.touches[0]?.clientY ?? null; },
    onTouchMove: (event: TouchEvent<HTMLDivElement>) => {
      const y = event.touches[0]?.clientY;
      if (y !== undefined && touchY.current !== null && y > touchY.current) pauseFollowing();
      touchY.current = y ?? null;
    },
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.isContentEditable || target.closest('input, textarea, select')) return;
      if (['ArrowUp', 'PageUp', 'Home'].includes(event.key) || (event.key === ' ' && event.shiftKey)) pauseFollowing();
    },
  };
}
