'use client';

import { useEffect, useRef } from 'react';
import { orbColors, orbFrame, safePalette, type OrbVariant, type OrbColorMode } from './orbGeometry.js';
import { motionTokens, spectrumPalette, type MotionPalette, type MotionTokens, type MotionStyle } from './tokens.js';
import { paintSculpturalOrb } from './sculpturalOrb.js';

export interface ThinkingOrbProps {
  variant?: OrbVariant;
  /** CSS pixels, clamped to 16–192. Omit to inherit the size token. */
  size?: number;
  /** 0 freezes; other values are clamped to 0.25–3. Omit to inherit the speed token. */
  speed?: number;
  paused?: boolean;
  /** Quiet neutral ink with brand highlights, or a completely monochrome orb. */
  colorMode?: OrbColorMode;
  /** Detail and weight: particles, or folds/strands and edge width for sculptural orbs. */
  density?: number;
  dotScale?: number;
  /** Six-digit hex stops. Overrides theme colors for this orb only. */
  palette?: MotionPalette;
  tokens?: MotionTokens;
  className?: string;
  style?: MotionStyle;
  /** Decorative by default. Supply a label for a standalone accessible image. */
  label?: string;
}

export function ThinkingOrb({ variant = 'band', size, speed, paused = false, colorMode = 'brand', density, dotScale, palette, tokens, className = '', style, label }: ThinkingOrbProps) {
  const host = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(.65);
  const paletteKey = palette === undefined ? undefined : safePalette(palette).join('|');
  useEffect(() => {
    const element = canvas.current;
    const wrapper = host.current;
    if (!element || !wrapper) return;
    const context = element.getContext('2d');
    if (!context) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const forcedColors = window.matchMedia('(forced-colors: active)');
    let colors = orbColors(spectrumPalette);
    let dimension = 36;
    let rate = 1;
    let particleDensity = 1;
    let particleScale = 1;
    let inView = true;
    let frame = 0;
    let lastTime = 0;

    const readTheme = () => {
      const computed = getComputedStyle(wrapper);
      const inheritedColors = ['cyan', 'blue', 'violet', 'red', 'orange'].map((key, index) =>
        computed.getPropertyValue(`--cm-${key}`).trim() || spectrumPalette[index]);
      colors = orbColors(paletteKey === undefined ? inheritedColors : paletteKey.split('|'), computed.getPropertyValue('--cm-orb-ink').trim() || computed.color, colorMode);
      const value = Number.parseFloat(computed.getPropertyValue('--cm-speed'));
      rate = Number.isFinite(value) ? value <= 0 ? 0 : Math.min(3, Math.max(.25, value)) : 1;
      const readMultiplier = (name: string, min: number, max: number) => {
        const value = Number.parseFloat(computed.getPropertyValue(name));
        return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 1;
      };
      particleDensity = readMultiplier('--cm-density', .5, 1.5);
      particleScale = readMultiplier('--cm-dot-scale', .5, 2);
      dimension = Math.max(16, Math.min(192, wrapper.getBoundingClientRect().width || 36));
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      element.width = Math.round(dimension * ratio);
      element.height = Math.round(dimension * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const paint = () => {
      context.clearRect(0, 0, dimension, dimension);
      if (variant === 'bloom' || variant === 'filament') {
        paintSculpturalOrb(context, variant, dimension, elapsed.current, colors, particleDensity, particleScale);
        return;
      }
      for (const dot of orbFrame(variant, elapsed.current, { size: dimension, density: particleDensity, dotScale: particleScale })) {
        context.globalAlpha = dot.opacity;
        context.fillStyle = colors[Math.round(dot.emphasis * 7) * 64 + Math.round(dot.color * 63)];
        context.beginPath();
        context.arc(dot.x * dimension, dot.y * dimension, Math.max(.24, dot.radius * dimension), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };
    const canAnimate = () => !paused && rate > 0 && !reduced.matches && !forcedColors.matches && !document.hidden && inView;
    const tick = (now: number) => {
      frame = 0;
      if (!canAnimate()) { lastTime = 0; return; }
      if (lastTime) elapsed.current += Math.min(80, now - lastTime) / 1000 * rate;
      lastTime = now;
      paint();
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      paint();
      if (canAnimate()) frame = requestAnimationFrame(tick);
    };
    const refreshTheme = () => { readTheme(); sync(); };
    refreshTheme();
    const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? false;
      sync();
    });
    intersection?.observe(wrapper);
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(refreshTheme);
    resize?.observe(wrapper);
    // Observe only this element and its ancestors, not all nodes in the application.
    // CSS variables therefore work for both the canvas palette and the CSS cursor.
    const themeObserver = typeof MutationObserver === 'undefined' ? null : new MutationObserver(refreshTheme);
    for (let ancestor: Element | null = wrapper; ancestor; ancestor = ancestor.parentElement) {
      themeObserver?.observe(ancestor, { attributes: true, attributeFilter: ['style', 'class', 'data-theme'] });
    }
    reduced.addEventListener('change', sync);
    forcedColors.addEventListener('change', sync);
    colorScheme.addEventListener('change', refreshTheme);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', refreshTheme);
    return () => {
      cancelAnimationFrame(frame);
      intersection?.disconnect();
      resize?.disconnect();
      themeObserver?.disconnect();
      reduced.removeEventListener('change', sync);
      forcedColors.removeEventListener('change', sync);
      colorScheme.removeEventListener('change', refreshTheme);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', refreshTheme);
    };
  }, [variant, paused, paletteKey, colorMode]);

  const overrides: MotionStyle = {};
  if (size !== undefined && Number.isFinite(size)) overrides['--cm-orb-size'] = `${Math.max(16, Math.min(192, size))}px`;
  if (speed !== undefined && Number.isFinite(speed)) overrides['--cm-speed'] = speed;
  if (density !== undefined && Number.isFinite(density)) overrides['--cm-density'] = Math.max(.5, Math.min(1.5, density));
  if (dotScale !== undefined && Number.isFinite(dotScale)) overrides['--cm-dot-scale'] = Math.max(.5, Math.min(2, dotScale));
  return <span ref={host} className={`cm-orb ${className}`} data-variant={variant} data-motion-paused={paused}
    style={{ ...motionTokens(tokens), ...style, ...overrides }}
    role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <canvas key={variant} ref={canvas} width={72} height={72}/>
  </span>;
}
