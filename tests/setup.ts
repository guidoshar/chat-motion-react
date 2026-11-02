import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn((query: string) => ({
    matches: false, media: query, onchange: null, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: () => false,
  })) });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
