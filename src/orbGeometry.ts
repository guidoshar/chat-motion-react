import { spectrumPalette, type MotionPalette } from './tokens.js';

export type ParticleOrbVariant = 'band' | 'ping' | 'ribbon' | 'solving' | 'composing';
export type SculpturalOrbVariant = 'bloom' | 'filament';
export type OrbVariant = ParticleOrbVariant | SculpturalOrbVariant;
export type OrbColorMode = 'brand' | 'mono';
type Point = { x: number; y: number; z: number };
type Particle = Point & { light: number; color: number; weight: number; emphasis: number };
export type OrbDot = { x: number; y: number; radius: number; opacity: number; color: number; depth: number; emphasis: number };
export interface OrbFrameOptions { size?: number; density?: number; dotScale?: number }
const TAU = Math.PI * 2;
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const finite = (value: number | undefined, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export const orbVariants: readonly OrbVariant[] = Object.freeze(['solving', 'composing', 'ping', 'band', 'ribbon', 'bloom', 'filament']);

function spherePoints(count: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - 2 * (index + .5) / count;
    const radius = Math.sqrt(1 - y * y);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
  });
}

type Mesh = { sphere: Point[]; lattice: Point[]; ghost: Point[]; lanes: number; segments: number };
const meshes = new Map<string, Mesh>();

/** Three size tiers × five density buckets: bounded cache for live theme editing. */
function meshFor(size: number, density: number): Mesh {
  const tier = size <= 28 ? 0 : size <= 72 ? 1 : 2;
  const bucket = Math.round(clamp(density, .5, 1.5) * 4) / 4;
  const key = `${tier}:${bucket}`;
  const cached = meshes.get(key);
  if (cached) return cached;
  const scale = Math.sqrt(bucket);
  const rings = Math.round([7, 11, 15][tier] * scale);
  const meridians = Math.round([14, 26, 34][tier] * scale);
  const lattice: Point[] = [];
  for (let ring = 0; ring <= rings; ring++) {
    const latitude = -Math.PI / 2 + ring / rings * Math.PI;
    const radius = Math.cos(latitude);
    const count = Math.max(1, Math.round(radius * meridians));
    for (let column = 0; column < count; column++) {
      const angle = column / count * TAU;
      lattice.push({ x: Math.cos(angle) * radius, y: Math.sin(latitude), z: Math.sin(angle) * radius });
    }
  }
  const mesh = {
    sphere: spherePoints(Math.round([72, 150, 230][tier] * bucket)),
    lattice,
    ghost: spherePoints(Math.round([24, 52, 76][tier] * bucket)),
    lanes: Math.min(13, Math.round([5, 9, 12][tier] * scale)),
    segments: Math.min(64, Math.round([22, 42, 58][tier] * scale)),
  };
  meshes.set(key, mesh);
  return mesh;
}

function rotate(point: Point, yaw: number, tilt: number): Point {
  const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const z = point.z * Math.cos(yaw) - point.x * Math.sin(yaw);
  return { x, y: point.y * Math.cos(tilt) - z * Math.sin(tilt), z: point.y * Math.sin(tilt) + z * Math.cos(tilt) };
}

// Solving and composing adapt MIT-licensed thinking-orbs geometry by Jakub Antalik
// (2026). See THIRD_PARTY_NOTICES.md for the complete license and pinned source.
type Move = { axis: 'x' | 'y' | 'z'; low: number; direction: number };
const moves: readonly Move[] = [
  { axis: 'y', low: 0, direction: 1 }, { axis: 'x', low: -.5, direction: -1 },
  { axis: 'z', low: .5, direction: 1 }, { axis: 'y', low: -1, direction: -1 },
  { axis: 'x', low: .5, direction: 1 }, { axis: 'z', low: -.5, direction: -1 },
  { axis: 'y', low: .5, direction: 1 }, { axis: 'x', low: -1, direction: -1 },
  { axis: 'z', low: 0, direction: 1 }, { axis: 'y', low: -.5, direction: -1 },
];

function solving(mesh: Mesh, seconds: number): Particle[] {
  const slotDuration = .27;
  const rest = .8;
  const time = seconds % (moves.length * 2 * slotDuration + rest);
  const slot = Math.floor(time / slotDuration);
  const reversing = slot >= moves.length;
  const active = slot < moves.length * 2 ? reversing ? moves.length * 2 - slot - 1 : slot : -1;
  const fraction = clamp((time % slotDuration) / slotDuration / .78);
  const eased = 1 - (1 - fraction) ** 3;
  const amounts = moves.map((_, index) => active < 0 ? 0 : index < active ? 1 : index > active ? 0 : reversing ? 1 - eased : eased);

  return mesh.lattice.map(source => {
    let { x, y, z } = source;
    let activeBand = false;
    for (let index = 0; index < moves.length; index++) {
      if (amounts[index] <= 0) continue;
      const move = moves[index];
      const coordinate = move.axis === 'x' ? x : move.axis === 'y' ? y : z;
      if (coordinate < move.low - 1e-8 || coordinate >= move.low + .5 - 1e-8) continue;
      if (index === active) activeBand = true;
      const angle = amounts[index] * move.direction * Math.PI / 2;
      const cos = Math.cos(angle), sin = Math.sin(angle);
      if (move.axis === 'x') [y, z] = [y * cos - z * sin, y * sin + z * cos];
      else if (move.axis === 'y') [x, z] = [x * cos + z * sin, z * cos - x * sin];
      else [x, y] = [x * cos - y * sin, x * sin + y * cos];
    }
    return {
      ...rotate({ x, y, z }, seconds * .19, .34),
      light: activeBand ? 1 : .66,
      color: clamp((source.y + 1) * .35 + (source.x + 1) * .15),
      weight: activeBand ? 1.13 : .93,
      emphasis: activeBand ? .95 : .08,
    };
  });
}

function composing(mesh: Mesh, seconds: number): Particle[] {
  const particles: Particle[] = mesh.ghost.map(point => ({
    ...rotate(point, 0, .28), light: .14, color: .3, weight: .52, emphasis: 0,
  }));
  const tilt = .55;
  const t = seconds * 1.55;
  for (let lane = 0; lane < mesh.lanes; lane++) {
    const offset = (lane / Math.max(1, mesh.lanes - 1) - .5) * .76;
    const edge = Math.abs(offset) / .38;
    for (let index = 0; index < mesh.segments; index++) {
      const angle = index / mesh.segments * TAU;
      const wave = .16 * Math.sin(angle * 3 - t * 1.7 + lane * .22) + .07 * Math.sin(angle * 5 + t * 1.1);
      const off = offset + wave;
      const point = { x: Math.cos(angle), y: Math.cos(tilt) * Math.sin(angle) - Math.sin(tilt) * off, z: Math.sin(tilt) * Math.sin(angle) + Math.cos(tilt) * off };
      const length = Math.hypot(point.x, point.y, point.z);
      const crest = .5 + .5 * Math.sin(angle * 2 - t * .7);
      particles.push({
        ...rotate({ x: point.x / length, y: point.y / length, z: point.z / length }, 0, .28),
        light: .76 + .24 * crest, color: index / mesh.segments,
        weight: .76 * (1 - .2 * edge), emphasis: .12 + .8 * crest * (1 - .45 * edge),
      });
    }
  }
  return particles;
}

/** Original ping implementation: a geodesic ring travels out and back in 4.2 seconds. */
function ping(mesh: Mesh, seconds: number): Particle[] {
  const phase = seconds % 4.2 / 4.2;
  const travel = phase < .5 ? phase * 2 : (1 - phase) * 2;
  const waveAngle = Math.PI * (.5 - .5 * Math.cos(travel * Math.PI));
  const direction = phase < .5 ? 1 : -1;
  return mesh.sphere.map(point => {
    const distance = Math.acos(clamp(point.x * -.6 + point.y * .36 + point.z * Math.sqrt(1 - .6 ** 2 - .36 ** 2), -1, 1));
    const delta = distance - waveAngle;
    const pulse = Math.exp(-((delta / .14) ** 2));
    const wake = Math.exp(-(((delta + direction * .23) / .3) ** 2)) * .3;
    const light = clamp(pulse + wake);
    return { ...point, light: .22 + .78 * light, color: clamp(distance / Math.PI), weight: .58 + .65 * light, emphasis: light };
  });
}

function legacy(variant: 'band' | 'ribbon', mesh: Mesh, seconds: number): Particle[] {
  const phase = seconds % (variant === 'band' ? 5.6 : 6) / (variant === 'band' ? 5.6 : 6) * TAU;
  if (variant === 'ribbon') {
    const particles: Particle[] = [];
    for (let lane = 0; lane < 4; lane++) {
      for (let index = 0; index < mesh.segments; index++) {
        const travel = (index / mesh.segments + phase / TAU) % 1;
        const latitude = Math.PI * travel;
        const longitude = 2 * TAU * travel + (lane - 1.5) * .14;
        const radius = Math.sin(latitude);
        particles.push({ ...rotate({ x: Math.cos(longitude) * radius, y: Math.cos(latitude), z: Math.sin(longitude) * radius }, phase, -.28), light: radius ** .45, color: clamp(travel * .88 + lane * .035), weight: .82, emphasis: 1 });
      }
    }
    return particles;
  }
  const tilt = .3 + .55 * Math.sin(phase);
  const axis = { x: Math.cos(phase) * Math.cos(tilt), y: Math.sin(tilt), z: Math.sin(phase) * Math.cos(tilt) };
  return mesh.sphere.map(point => {
    const distance = point.x * axis.x + point.y * axis.y + point.z * axis.z;
    const light = Math.exp(-((distance / .25) ** 2));
    return { ...rotate(point, phase, .22), light, color: clamp((point.y + 1) * .35 + (point.x + 1) * .15), weight: .58 + .52 * light, emphasis: 1 };
  });
}

/** CPU-only deterministic geometry, bounded counts and screen-relative dot sizes. */
export function orbFrame(variant: ParticleOrbVariant, seconds: number, options: OrbFrameOptions = {}): OrbDot[] {
  const size = clamp(finite(options.size, 64), 16, 192);
  const mesh = meshFor(size, finite(options.density, 1));
  const time = Math.max(0, finite(seconds, 0));
  const dotScale = clamp(finite(options.dotScale, 1), .5, 2);
  const modern = variant === 'solving' || variant === 'composing' || variant === 'ping';
  const particles = variant === 'solving' ? solving(mesh, time)
    : variant === 'composing' ? composing(mesh, time)
    : variant === 'ping' ? ping(mesh, time)
    : legacy(variant === 'ribbon' ? 'ribbon' : 'band', mesh, time);
  const radiusScale = modern ? (64 / size) ** .28 : 1;
  return particles.map(point => {
    const depth = clamp((point.z + 1) / 2);
    const perspective = modern ? 5.2 / (5.2 - point.z) : 3.8 / (3.8 - point.z);
    return {
      x: .5 + point.x * (modern ? .385 : .345) * perspective,
      y: .5 + point.y * (modern ? .385 : .345) * perspective,
      radius: (modern ? .0044 + .0071 * depth : .005 + .0105 * depth) * point.weight * perspective * dotScale * radiusScale,
      opacity: clamp((.18 + .82 * depth) * (.2 + .8 * point.light)),
      color: point.color, depth: point.z, emphasis: point.emphasis,
    };
  }).sort((a, b) => a.depth - b.depth);
}

type RGB = readonly [number, number, number];
const hexRGB = (value: string): RGB => [parseInt(value.slice(1, 3), 16), parseInt(value.slice(3, 5), 16), parseInt(value.slice(5, 7), 16)];
export function safePalette(palette: MotionPalette | undefined): string[] {
  const valid = Array.isArray(palette) ? palette.slice(0, 16).filter((color): color is string => typeof color === 'string' && /^#[\da-f]{6}$/i.test(color)) : [];
  return valid.length ? valid : [...spectrumPalette];
}
function inkRGB(value: string): RGB {
  if (/^#[\da-f]{6}$/i.test(value)) return hexRGB(value);
  const channels = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(value);
  return channels ? [clamp(Number(channels[1]), 0, 255), clamp(Number(channels[2]), 0, 255), clamp(Number(channels[3]), 0, 255)] : [94, 111, 134];
}

/** 8 ink-to-brand levels × 64 gradient stops; rebuilt only on theme changes. */
export function orbColors(palette: MotionPalette, ink = '#5E6F86', mode: OrbColorMode = 'brand'): string[] {
  const stops = safePalette(palette).map(hexRGB);
  const neutral = inkRGB(ink);
  return Array.from({ length: 512 }, (_, index) => {
    const emphasis = mode === 'mono' ? 0 : Math.floor(index / 64) / 7;
    const position = index % 64 / 63 * (stops.length - 1);
    const left = stops[Math.floor(position)], right = stops[Math.ceil(position)];
    const fraction = position % 1;
    return `rgb(${left.map((value, channel) => Math.round(neutral[channel] * (1 - emphasis) + (value + (right[channel] - value) * fraction) * emphasis)).join(',')})`;
  });
}
