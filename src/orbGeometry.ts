import { spectrumPalette, type MotionPalette } from './tokens.js';

export type OrbVariant = 'band' | 'ping' | 'ribbon';
type Point = { x: number; y: number; z: number };
type Particle = Point & { light: number; color: number; weight: number };
export type OrbDot = { x: number; y: number; radius: number; opacity: number; color: number; depth: number };
const TAU = Math.PI * 2;
const periods: Record<OrbVariant, number> = { band: 5.6, ping: 4.8, ribbon: 6 };
const sphere: readonly Point[] = Array.from({ length: 160 }, (_, index) => {
  const y = 1 - 2 * (index + .5) / 160;
  const radius = Math.sqrt(1 - y * y);
  const angle = index * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
});
const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function rotate(point: Point, yaw: number, tilt: number): Point {
  const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const z = point.z * Math.cos(yaw) - point.x * Math.sin(yaw);
  return { x, y: point.y * Math.cos(tilt) - z * Math.sin(tilt), z: point.y * Math.sin(tilt) + z * Math.cos(tilt) };
}

/** Original particle geometry, independently implemented with Canvas 2D, not third-party shaders. */
export function orbFrame(variant: OrbVariant, seconds: number): OrbDot[] {
  const phase = (seconds / periods[variant] % 1) * TAU;
  const particles: Particle[] = [];
  if (variant === 'ribbon') {
    for (let lane = 0; lane < 4; lane++) {
      for (let index = 0; index < 42; index++) {
        const travel = (index / 42 + phase / TAU) % 1;
        const latitude = Math.PI * travel;
        const longitude = 2 * TAU * travel + (lane - 1.5) * .14;
        const radius = Math.sin(latitude);
        const point = rotate({ x: Math.cos(longitude) * radius, y: Math.cos(latitude), z: Math.sin(longitude) * radius }, phase, -.28);
        particles.push({ ...point, light: Math.pow(radius, .45), color: clamp(travel * .88 + lane * .035), weight: .82 });
      }
    }
  } else {
    const tilt = .3 + .55 * Math.sin(phase);
    const beltAxis = { x: Math.cos(phase) * Math.cos(tilt), y: Math.sin(tilt), z: Math.sin(phase) * Math.cos(tilt) };
    const waveAngle = Math.PI * (.5 - .5 * Math.cos(phase));
    for (const point of sphere) {
      const angularDistance = Math.acos(clamp(point.x, -1, 1));
      const distance = variant === 'band'
        ? point.x * beltAxis.x + point.y * beltAxis.y + point.z * beltAxis.z
        : angularDistance - waveAngle;
      const light = Math.exp(-Math.pow(distance / (variant === 'band' ? .25 : .24), 2));
      particles.push({ ...rotate(point, phase, .22), light,
        color: clamp((point.y + 1) / 2 * .7 + (point.x + 1) / 2 * .3), weight: .58 + .52 * light });
    }
  }
  return particles.map(point => {
    const depth = clamp((point.z + 1) / 2);
    const perspective = 3.8 / (3.8 - point.z);
    return {
      x: .5 + point.x * .345 * perspective, y: .5 + point.y * .345 * perspective,
      radius: (.005 + .0105 * depth) * point.weight * perspective,
      opacity: clamp((.17 + .83 * depth) * (.24 + .76 * point.light)),
      color: point.color, depth: point.z,
    };
  }).sort((a, b) => a.depth - b.depth);
}

/** Six-digit hex stops keep interpolation predictable across canvas implementations. */
export function orbColors(palette: MotionPalette): string[] {
  const valid = palette.filter(color => /^#[\da-f]{6}$/i.test(color));
  const stops = (valid.length ? valid : spectrumPalette).map(color => [1, 3, 5].map(start => parseInt(color.slice(start, start + 2), 16)));
  return Array.from({ length: 64 }, (_, index) => {
    const position = index / 63 * (stops.length - 1);
    const left = stops[Math.floor(position)], right = stops[Math.ceil(position)];
    const fraction = position % 1;
    return `rgb(${left.map((value, channel) => Math.round(value + (right[channel] - value) * fraction)).join(',')})`;
  });
}
