import type { OrbColorMode, OrbVariant } from './orbGeometry.js';
import type { StreamCursor, TextReveal } from './StreamingText.js';

export type ResponsePreset = 'clear' | 'aurora' | 'glass' | 'bloom' | 'filament';
export interface ResponsePresetDefinition {
  readonly name: string;
  readonly orb: OrbVariant;
  readonly colorMode: OrbColorMode;
  readonly reveal: TextReveal;
  readonly cursor: StreamCursor;
}

/** Original coordinated treatments, not Microsoft/Copilot components. */
export const responsePresets: Readonly<Record<ResponsePreset, ResponsePresetDefinition>> = Object.freeze({
  bloom: Object.freeze({ name: 'Bloom', orb: 'bloom', colorMode: 'brand', reveal: 'resolve', cursor: 'prism' }),
  filament: Object.freeze({ name: 'Filament', orb: 'filament', colorMode: 'brand', reveal: 'ink', cursor: 'nib' }),
  clear: Object.freeze({ name: 'Clear', orb: 'composing', colorMode: 'mono', reveal: 'soft', cursor: 'beam' }),
  aurora: Object.freeze({ name: 'Aurora', orb: 'solving', colorMode: 'brand', reveal: 'blur', cursor: 'dot' }),
  glass: Object.freeze({ name: 'Glass', orb: 'ping', colorMode: 'brand', reveal: 'fade', cursor: 'line' }),
});
