import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ActivityPanel, ChatResponse, MotionTheme, StatusPill, ThinkingIndicator, TransitionOrb,
  createMotionTokens, motionTokens, useStreamingReveal } from '../src/index.js';
import { StreamingMarkdown } from '../src/markdown.js';

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

describe('theme contract', () => {
  it('coordinates semantic and legacy colors from one accent, with scoped overrides', () => {
    const tokens = createMotionTokens('#765432', { textColor: '#101010', panelRadius: 0 });
    const style = motionTokens(tokens);
    expect(style['--cm-accent']).toBe('#765432');
    expect(style['--cm-cyan']).toBe('#765432');
    expect(style['--cm-text']).toBe('#101010');
    expect(style['--cm-panel-radius']).toBe('0px');
    expect(style['--cm-subtle']).not.toBe(style['--cm-accent']);
    expect(() => createMotionTokens('var(--color)')).toThrow(TypeError);
    const { container } = render(<MotionTheme tokens={tokens}><ChatResponse text="Hi" phase="complete" /></MotionTheme>);
    expect((container.firstChild as HTMLElement).style.getPropertyValue('--cm-accent')).toBe('#765432');
    expect(container.querySelector('.cm-response')?.getAttribute('style')).toBeNull();
  });
  it('bounds new timings and dimensions and rejects unsafe values without changing existing tokens', () => {
    const style = motionTokens({ orbTransitionMs: 99999, collapseMs: -9, responseLineHeight: NaN, accentColor: 'url(https://example.com)',
      surfaceColor: 'var(--surface)', cursorHeight: '1.1em', speed: 0, panelRadius: Infinity });
    expect(style['--cm-orb-transition']).toBe('3000ms');
    expect(style['--cm-collapse']).toBe('0ms');
    expect(style['--cm-accent']).toBeUndefined();
    expect(style['--cm-response-line-height']).toBeUndefined();
    expect(style['--cm-panel-radius']).toBeUndefined();
    expect(style['--cm-surface']).toBe('var(--surface)');
    expect(style['--cm-speed']).toBe('0');
    expect(style['--cm-cursor-height']).toBe('1.1em');
  });
});

describe('thinking and activity', () => {
  it('keeps at most two orb layers through rapid changes and cleans the transition timer', () => {
    vi.useFakeTimers();
    const { container, rerender, unmount } = render(<TransitionOrb variant="band" tokens={{ orbTransitionMs: 300 }} />);
    rerender(<TransitionOrb variant="solving" tokens={{ orbTransitionMs: 300 }} />);
    expect(container.querySelectorAll('canvas')).toHaveLength(2);
    rerender(<TransitionOrb variant="ribbon" tokens={{ orbTransitionMs: 300 }} />);
    expect(container.querySelectorAll('canvas')).toHaveLength(2);
    advance(301);
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('cycles supplied waiting labels without announcing every cycle and stops when inactive', () => {
    vi.useFakeTimers();
    const { container, rerender, unmount } = render(<ThinkingIndicator messages={['One', 'Two']} messageIntervalMs={1000} />);
    expect(container.textContent).toBe('One');
    expect(screen.queryByRole('status')).toBeNull();
    advance(1000);
    expect(container.textContent).toBe('Two');
    rerender(<ThinkingIndicator active={false} messages={['One', 'Two']} />);
    expect(container.textContent).toBe('');
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('uses deterministic SSR output and renders an empty message list safely', () => {
    const first = renderToString(<ThinkingIndicator messages={[]} variants={[]} />);
    expect(first).toContain('Preparing a response');
    expect(renderToString(<ThinkingIndicator messages={[]} variants={[]} />)).toBe(first);
    expect(renderToString(<ChatResponse text="Saved reply" phase="complete" historical />)).not.toContain('canvas');
  });
  it('stops waiting timers for hidden and reduced-motion readers', () => {
    vi.useFakeTimers();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    const { container, unmount } = render(<ThinkingIndicator messages={['One', 'Two']} messageIntervalMs={1000} />);
    hidden.mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    advance(16000);
    expect(container.textContent).toBe('One');
    expect(vi.getTimerCount()).toBe(0);
    unmount();
    hidden.mockReturnValue(false);
    vi.mocked(window.matchMedia).mockImplementation(query => ({ matches: query.includes('reduced-motion'), media: query,
      addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList);
    render(<ThinkingIndicator />);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('auto-collapses completion, preserves mounted contents and permits explicit reopening', () => {
    const steps = [{ id: 'read', label: 'Read material', state: 'complete' as const }];
    const { container, rerender } = render(<ActivityPanel label="Working" steps={steps} summary={<a href="#details">Read summary</a>} />);
    const body = container.querySelector('.cm-collapse');
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
    rerender(<ActivityPanel label="Complete" state="complete" steps={steps} summary={<a href="#details">Read summary</a>} />);
    expect(container.querySelector('.cm-collapse')).toBe(body);
    expect(body?.hasAttribute('inert')).toBe(true);
    expect(screen.queryByRole('link')).toBeNull();
    fireEvent.click(screen.getByRole('button'));
    expect(body?.hasAttribute('inert')).toBe(false);
    expect(screen.getByRole('link')).toBeTruthy();
  });
  it('supports controlled disclosure and keeps history quiet', () => {
    const change = vi.fn();
    render(<ActivityPanel label="Saved activity" historical expanded={false} onExpandedChange={change} />);
    fireEvent.click(screen.getByRole('button'));
    expect(change).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('status')).toBeNull();
  });
  it('retains the original status API and disables extra motion when paused', () => {
    const { container } = render(<StatusPill label="Ready" status="success" paused animatedLabel announce />);
    expect(screen.getByRole('status').textContent).toBe('Ready');
    expect(container.querySelector('canvas')).toBeNull();
    expect(screen.getByRole('status').getAttribute('data-motion-paused')).toBe('true');
  });
});

describe('chat composition and Markdown', () => {
  it('localizes waiting copy while allowing explicit rotating copy to take precedence', () => {
    const { container, rerender } = render(<ChatResponse text="" phase="waiting" labels={{ waiting: 'Please wait' }} />);
    expect(container.textContent).toBe('Please wait');
    rerender(<ChatResponse text="" phase="waiting" labels={{ waiting: 'Please wait' }} waiting={{ messages: ['Custom waiting message'] }} />);
    expect(container.textContent).toBe('Custom waiting message');
  });
  it('works with plain text alone and only reveals an optional result once complete', () => {
    const result = <figure aria-label="Example chart">Sample result</figure>;
    const { rerender } = render(<ChatResponse text="Hello" result={result} />);
    expect(screen.queryByRole('figure')).toBeNull();
    rerender(<ChatResponse text="Hello world" phase="complete" result={result} />);
    expect(screen.getByRole('figure')).toBeTruthy();
    rerender(<ChatResponse text="Only text" phase="complete" />);
    expect(screen.queryByRole('figure')).toBeNull();
    expect(screen.getByText('Only text')).toBeTruthy();
  });
  it('keeps partial content after cancellation or error, without replaying historical responses', () => {
    const { container, rerender } = render(<ChatResponse text="Partial reply" phase="error" labels={{ error: 'Try again' }} />);
    expect(screen.getByRole('status').textContent).toBe('Try again');
    expect(container.textContent).toContain('Partial reply');
    expect(container.querySelector('.cm-stream-caret')).toBeNull();
    rerender(<ChatResponse text="Saved reply" phase="complete" historical />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();
  });
  it('preserves nested lists, GFM tables, emphasis and Unicode through streamed updates', () => {
    const text = '- **First**\n\n  Explanation\n\n- Next\n  1. Inspect `value`\n     - Done 👩🏽‍💻\n\n| Group | Value |\n|---|---|\n| A | 12 |';
    const { container, rerender } = render(<StreamingMarkdown text={text} />);
    expect(container.querySelector('li p strong')?.textContent).toBe('First');
    expect(container.querySelector('li ol li ul li')?.textContent).toContain('Done 👩🏽‍💻');
    expect(screen.getAllByRole('cell')).toHaveLength(2);
    expect(container.querySelectorAll('.cm-markdown-cursor')).toHaveLength(1);
    rerender(<StreamingMarkdown text={text} phase="idle" />);
    expect(container.querySelector('.cm-stream-caret')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe('value');
  });
  it('blocks raw HTML, executable links and automatic external images by default', () => {
    const { container, rerender } = render(<StreamingMarkdown text={'[Link](javascript:alert%281%29)\n\n<script>alert(1)</script>\n\n![Remote image](https://example.com/asset.png)'} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('a')?.getAttribute('href')).toBe('');
    expect(container.querySelector('img')).toBeNull();
    rerender(<StreamingMarkdown text="![Image](https://example.com/asset.png)" allowImages />);
    expect(screen.getByRole('img').getAttribute('loading')).toBe('lazy');
  });
});

describe('optional presentation queue', () => {
  it('handles rapid deltas without timer starvation or splitting graphemes', () => {
    vi.useFakeTimers();
    const { result, rerender, unmount } = renderHook(useStreamingReveal, { initialProps: { id: 'one', text: '', complete: false } });
    let text = '';
    for (let i = 0; i < 25; i++) {
      text += '👩🏽‍💻e\u0301';
      rerender({ id: 'one', text, complete: false });
      advance(20);
    }
    expect(result.current.text.length).toBeGreaterThan(0);
    const boundaries = new Set(Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), s => s.index + s.segment.length));
    expect(boundaries.has(result.current.text.length)).toBe(true);
    rerender({ id: 'one', text, complete: true });
    for (let i = 0; i < 35; i++) advance(40);
    expect(result.current).toMatchObject({ text, pending: false, complete: true });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('flushes immediately on interruption and does not replay after a hidden tab returns', () => {
    vi.useFakeTimers();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    const { result, rerender } = renderHook(useStreamingReveal, { initialProps: { text: '', complete: false, interrupted: false } });
    const text = 'A long response. '.repeat(100);
    rerender({ text, complete: true, interrupted: false });
    advance(40);
    expect(result.current.pending).toBe(true);
    hidden.mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.text).toBe(text);
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.pending).toBe(false);
    rerender({ text: text + ' partial', complete: false, interrupted: true });
    expect(result.current.text).toBe(text + ' partial');
    expect(result.current.pending).toBe(false);
  });
  it('resets when the response id changes, and cleans up StrictMode timers', () => {
    vi.useFakeTimers();
    const { result, rerender, unmount } = renderHook(useStreamingReveal, { initialProps: { id: 'a', text: 'Old answer', historical: true }, wrapper: StrictMode });
    expect(result.current.text).toBe('Old answer');
    rerender({ id: 'b', text: 'New answer', historical: false });
    expect(result.current.text).toBe('');
    advance(80);
    expect(result.current.text.length).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
