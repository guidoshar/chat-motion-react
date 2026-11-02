'use client';

import { useEffect, useRef, useState } from 'react';
import { StatusPill, type StatusPillProps } from './StatusPill.js';
import { useMotionEnvironment } from './useMotionEnvironment.js';
import type { OrbVariant } from './orbGeometry.js';
import { useChatTiming } from './useChatTiming.js';

const defaultMessages = ['Preparing a response', 'Working on your request', 'Considering the details'];
const defaultVariants: OrbVariant[] = ['composing', 'solving', 'ribbon', 'band', 'ping'];
const interval = (value: number, fallback: number) => Number.isFinite(value) ? Math.max(1000, Math.min(60000, value)) : fallback;

export interface ThinkingIndicatorProps extends Omit<StatusPillProps, 'label' | 'variant' | 'status'> {
  active?: boolean;
  messages?: readonly string[];
  variants?: readonly OrbVariant[];
  messageIntervalMs?: number;
  variantIntervalMs?: number;
}

/** Waiting copy describes waiting, not simulated work or progress. The caller ends it on actual output. */
export function useWaitingState({ active = true, messages = defaultMessages, variants = defaultVariants,
  messageIntervalMs = 5000, variantIntervalMs = 15000, paused = false }: ThinkingIndicatorProps) {
  const quiet = useMotionEnvironment();
  const [copy, setCopy] = useState(0);
  const [shape, setShape] = useState(0);
  const stopped = !active || paused || quiet;
  const copyMs = interval(messageIntervalMs, 5000);
  const shapeMs = interval(variantIntervalMs, 15000);
  useEffect(() => {
    if (stopped || messages.length < 2) return;
    const timer = window.setInterval(() => setCopy(value => value + 1), copyMs);
    return () => window.clearInterval(timer);
  }, [stopped, messages.length, copyMs]);
  useEffect(() => {
    if (stopped || variants.length < 2) return;
    const timer = window.setInterval(() => setShape(value => value + 1), shapeMs);
    return () => window.clearInterval(timer);
  }, [stopped, variants.length, shapeMs]);
  return { label: messages.length ? messages[copy % messages.length] : defaultMessages[0],
    variant: variants.length ? variants[shape % variants.length] : defaultVariants[0] };
}

export function ThinkingIndicator({ active = true, messages, variants, messageIntervalMs, variantIntervalMs,
  paused = false, announce = false, transition = false, ...props }: ThinkingIndicatorProps) {
  const host = useRef<HTMLSpanElement>(null);
  const timing = useChatTiming(host, active);
  const waiting = useWaitingState({ active, messages, variants,
    messageIntervalMs: messageIntervalMs ?? timing.messageIntervalMs,
    variantIntervalMs: variantIntervalMs ?? timing.variantIntervalMs, paused });
  if (!active) return null;
  return <StatusPill ref={host} {...props} {...waiting} transition={transition} animatedLabel paused={paused} announce={announce} />;
}
