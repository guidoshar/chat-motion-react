import type { SculpturalOrbVariant } from './orbGeometry.js';

const TAU = Math.PI * 2;
type Vertex = { x: number; y: number; z: number };
interface SurfaceOptions { density: number; weight: number }

// Independent surface/path renderers. Neither calls the five particle geometries.
// No images, shaders, offscreen buffers, random inputs or per-frame React state.
function silhouette(ctx: CanvasRenderingContext2D, time: number, radius: number) {
  ctx.beginPath();
  for (let i = 0; i <= 96; i++) {
    const a = i / 96 * TAU;
    const r = radius * (1 + .035 * Math.sin(3 * a + time * .7) + .02 * Math.cos(2 * a - time * .43));
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function bloom(ctx: CanvasRenderingContext2D, size: number, time: number, colors: readonly string[], { density, weight }: SurfaceOptions) {
  const radius = size * (.355 + .009 * Math.sin(time * 1.15));
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(.18 * Math.sin(time * .35));
  silhouette(ctx, time, radius);
  ctx.clip();

  // A moving continuous material: translucent body, chromatic volumes and
  // folded membranes. Highlights stay inside the orb, never on the container.
  const body = ctx.createLinearGradient(-radius, -radius, radius, radius);
  body.addColorStop(0, colors[448]);
  body.addColorStop(.5, colors[473]);
  body.addColorStop(1, colors[499]);
  ctx.globalAlpha = .8;
  ctx.fillStyle = body;
  ctx.fillRect(-size / 2, -size / 2, size, size);

  for (let lobe = 0; lobe < 4; lobe++) {
    const a = time * .38 + lobe * TAU / 4;
    const x = Math.cos(a) * radius * .69, y = Math.sin(a * .83 + lobe * .3) * radius * .59;
    const light = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.35);
    light.addColorStop(0, colors[448 + Math.round(lobe / 3 * 63)]);
    light.addColorStop(.35, colors[448 + Math.round(lobe / 3 * 63)]);
    light.addColorStop(1, 'transparent');
    ctx.fillStyle = light;
    ctx.globalAlpha = .55;
    ctx.fillRect(-size / 2, -size / 2, size, size);
  }

  const folds = Math.max(3, Math.min(7, Math.round(4 * density)));
  for (let fold = 0; fold < folds; fold++) {
    ctx.save();
    ctx.rotate(fold / folds * TAU + time * .2);
    const bend = radius * (.34 + .16 * Math.sin(time * .9 + fold));
    ctx.beginPath();
    ctx.moveTo(-radius * 1.06, -radius * .28);
    ctx.bezierCurveTo(-radius * .2, -radius * 1.2, radius * .25, bend, radius * 1.05, -radius * .2);
    ctx.bezierCurveTo(radius * .4, radius * .6, -radius * .42, -bend * .25, -radius * 1.06, -radius * .28);
    const membrane = ctx.createLinearGradient(0, -radius * .68, 0, radius * .6);
    membrane.addColorStop(0, 'rgba(255,255,255,.65)');
    membrane.addColorStop(.36, 'rgba(255,255,255,.06)');
    membrane.addColorStop(.8, colors[448 + Math.round(fold / folds * 63)]);
    membrane.addColorStop(1, 'transparent');
    ctx.globalAlpha = .46;
    ctx.fillStyle = membrane;
    ctx.fill();
    ctx.globalAlpha = .32;
    ctx.lineWidth = Math.max(.45, size * .0045) * weight;
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.stroke();
    ctx.restore();
  }

  const pearl = ctx.createRadialGradient(-radius * .35, -radius * .4, 0, -radius * .25, -radius * .3, radius * 1.3);
  pearl.addColorStop(0, 'rgba(255,255,255,.78)');
  pearl.addColorStop(.3, 'rgba(255,255,255,.18)');
  pearl.addColorStop(.78, 'transparent');
  pearl.addColorStop(1, colors[466]);
  ctx.globalAlpha = .72;
  ctx.fillStyle = pearl;
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.restore();

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(.18 * Math.sin(time * .35));
  silhouette(ctx, time, radius);
  ctx.lineWidth = Math.max(.5, size * .005) * weight;
  ctx.globalAlpha = .32;
  ctx.strokeStyle = colors[458];
  ctx.stroke();
  ctx.restore();
}

function curve(lane: number, count: number, time: number, segments: number): Vertex[] {
  const tilt = (lane / (count - 1) - .5) * 2.45 + .22 * Math.sin(time * .45);
  const yaw = time * .23;
  const breath = .9 + .065 * Math.sin(time * 1.1);
  const points: Vertex[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = i / segments * TAU;
    const r = breath * (1 + .075 * Math.sin(a * 3 + time * .65 + lane * .3));
    const x = Math.cos(a) * r;
    const v = Math.sin(a) * r;
    const y = v * Math.cos(tilt);
    const z = v * Math.sin(tilt) + .07 * Math.sin(a * 2 - time);
    const rotatedX = x * Math.cos(yaw) + z * Math.sin(yaw);
    const depth = z * Math.cos(yaw) - x * Math.sin(yaw);
    const projection = 4.8 / (4.8 - depth);
    points.push({ x: rotatedX * projection, y: y * projection, z: depth });
  }
  return points;
}

function traceHalf(ctx: CanvasRenderingContext2D, points: Vertex[], front: boolean, radius: number) {
  ctx.beginPath();
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if ((a.z + b.z >= 0) !== front) continue;
    ctx.moveTo(a.x * radius, a.y * radius);
    ctx.lineTo(b.x * radius, b.y * radius);
  }
  ctx.stroke();
}

// Fractional progress keeps the travelling light smooth between geometry samples.
function sampleCurve(points: Vertex[], progress: number): Vertex {
  const segments = points.length - 1;
  const position = ((progress % segments) + segments) % segments;
  const index = Math.floor(position), fraction = position - index;
  const a = points[index], b = points[index + 1];
  return {
    x: a.x + (b.x - a.x) * fraction,
    y: a.y + (b.y - a.y) * fraction,
    z: a.z + (b.z - a.z) * fraction,
  };
}

function filament(ctx: CanvasRenderingContext2D, size: number, time: number, colors: readonly string[], { density, weight }: SurfaceOptions) {
  const count = Math.max(4, Math.min(12, Math.round((size < 40 ? 5 : 8) * density)));
  const segments = size < 40 ? 64 : 96;
  const radius = size * .365;
  const paths = Array.from({ length: count }, (_, lane) => curve(lane, count, time, segments));
  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(-.42 + .16 * Math.sin(time * .32));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const front of [false, true]) {
    for (let lane = 0; lane < count; lane++) {
      const colorIndex = Math.round(lane / (count - 1) * 63);
      const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
      gradient.addColorStop(0, colors[448 + colorIndex]);
      gradient.addColorStop(.5, colors[320 + colorIndex]);
      gradient.addColorStop(1, colors[448 + (colorIndex + 22) % 64]);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(.5, size * .0055) * weight;
      ctx.globalAlpha = front ? .79 : .14;
      traceHalf(ctx, paths[lane], front, radius);
    }
  }

  // One travelling glint per two paths; no particle cloud or dotted sphere.
  for (let lane = 0; lane < count; lane += 2) {
    const points = paths[lane];
    const head = ((time * .12 + lane / count) % 1) * segments;
    const length = Math.round(segments * .1);
    const point = sampleCurve(points, head);
    const ink = colors[448 + Math.round(lane / (count - 1) * 63)];
    ctx.strokeStyle = ink;
    for (let trail = length; trail > 0; trail--) {
      const a = sampleCurve(points, head - trail);
      const b = sampleCurve(points, head - trail + 1);
      ctx.globalAlpha = (1 - trail / (length + 1)) * (a.z > 0 ? .8 : .2);
      ctx.lineWidth = Math.max(.8, size * .011) * weight;
      ctx.beginPath(); ctx.moveTo(a.x * radius, a.y * radius); ctx.lineTo(b.x * radius, b.y * radius); ctx.stroke();
    }
    ctx.globalAlpha = point.z > 0 ? .9 : .25;
    ctx.fillStyle = ink;
    ctx.beginPath(); ctx.arc(point.x * radius, point.y * radius, Math.max(.6, size * .009) * weight, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export function paintSculpturalOrb(ctx: CanvasRenderingContext2D, variant: SculpturalOrbVariant, size: number, seconds: number, colors: readonly string[], density: number, weight: number) {
  const options = { density: Math.max(.5, Math.min(1.5, density)), weight: Math.max(.5, Math.min(2, weight)) };
  if (variant === 'bloom') bloom(ctx, size, seconds, colors, options);
  else filament(ctx, size, seconds, colors, options);
}
