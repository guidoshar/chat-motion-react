import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatResponse, MotionTheme, ThinkingIndicator, createMotionTokens, motionTokens, type ResponsePhase } from '../src/index.js';
import { MarkdownResponse, StreamingMarkdown } from '../src/markdown.js';

const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const steps = [{ id: 'request', label: 'Request sent', state: 'complete' as const },
  { id: 'reply', label: 'Receiving reply', state: 'running' as const }];

describe('complete response composition', () => {
  it('keeps one surface and process panel through waiting, streaming, and display completion', () => {
    vi.useFakeTimers();
    const result = <a href="#download">Download result</a>;
    const view = (phase: ResponsePhase, text: string) => <MarkdownResponse responseId="reply-1" phase={phase} text={text}
      activity={{ steps }} result={result} presentation={{ charactersPerSecond: 10, maxTailMs: 200 }} />;
    const { container, rerender } = render(view('waiting', ''));
    const surface = container.querySelector('.cm-response');
    const panel = container.querySelector('.cm-collapse');
    expect(surface?.getAttribute('data-framed')).toBe('false');
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
    tick(15000);
    expect(container.querySelectorAll('canvas')).toHaveLength(1);
    rerender(view('streaming', '**A long answer** '.repeat(20)));
    tick(40);
    expect(container.querySelector('.cm-response')).toBe(surface);
    expect(container.querySelector('.cm-collapse')).toBe(panel);
    expect(panel?.hasAttribute('inert')).toBe(true);
    expect(screen.queryByRole('link', { name: 'Download result' })).toBeNull();
    rerender(view('complete', '**A long answer** '.repeat(20)));
    expect(surface?.getAttribute('data-framed')).toBe('false');
    expect(container.textContent).toContain('Finishing the response display');
    tick(280);
    expect(surface?.getAttribute('data-framed')).toBe('true');
    expect(surface?.getAttribute('aria-busy')).toBe('false');
    expect(container.querySelectorAll('canvas')).toHaveLength(0);
    expect(screen.getByRole('link', { name: 'Download result' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button'));
    expect(panel?.hasAttribute('inert')).toBe(false);
  });

  it.each(['error', 'cancelled', 'incomplete'] as const)('flushes partial text on %s without success framing or result', phase => {
    vi.useFakeTimers();
    const actions = <button>Retry</button>;
    const { container, rerender } = render(<MarkdownResponse responseId="one" text="" phase="waiting" result={<figure>Result</figure>} actions={actions} />);
    const text = 'Partial answer 👩🏽‍💻 '.repeat(20);
    rerender(<MarkdownResponse responseId="one" text={text} phase="streaming" result={<figure>Result</figure>} actions={actions} />);
    tick(40);
    rerender(<MarkdownResponse responseId="one" text={text} phase={phase} result={<figure>Result</figure>} actions={actions} />);
    expect(container.querySelector('.cm-response-text')?.textContent).toBe(text.trim());
    expect(container.querySelector('.cm-response')?.getAttribute('data-framed')).toBe('false');
    expect(screen.queryByRole('figure')).toBeNull();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    expect(container.querySelector('.cm-stream-caret')).toBeNull();
  });

  it('allows partial results explicitly and shows saved completed answers without replay', () => {
    const { container, rerender } = render(<MarkdownResponse text="Partial" phase="error" resultWhen="terminal" result={<figure>Partial result</figure>} />);
    expect(screen.getByRole('figure')).toBeTruthy();
    rerender(<MarkdownResponse responseId="saved" text="Saved" phase="complete" historical activity={{ steps }} />);
    expect(container.querySelector('.cm-response')?.getAttribute('data-framed')).toBe('true');
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('.cm-stream-caret')).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
  });

  it('preserves a manual expansion through completion and resets for a new response', () => {
    const { rerender } = render(<ChatResponse responseId="one" phase="thinking" text="" activity={{ steps }} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    rerender(<ChatResponse responseId="one" phase="complete" text="Done" activity={{ steps }} />);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
    rerender(<ChatResponse responseId="two" phase="streaming" text="Next" activity={{ steps }} />);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false');
  });

  it.each(['hidden', 'reduced'] as const)('flushes %s presentation and does not replay it', mode => {
    vi.useFakeTimers();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    const { container, rerender } = render(<MarkdownResponse text="" phase="waiting" />);
    const text = 'New answer '.repeat(100);
    rerender(<MarkdownResponse text={text} phase="complete" />);
    expect(container.querySelector('.cm-response')?.getAttribute('data-framed')).toBe('false');
    if (mode === 'hidden') hidden.mockReturnValue(true);
    else vi.mocked(window.matchMedia).mockImplementation(query => ({ matches: query.includes('reduced-motion'), media: query,
      addEventListener: vi.fn(), removeEventListener: vi.fn() }) as unknown as MediaQueryList);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(container.querySelector('.cm-response')?.getAttribute('data-framed')).toBe('true');
    expect(container.querySelector('.cm-response-text')?.textContent).toBe(text.trim());
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(container.querySelector('.cm-response')?.getAttribute('data-presentation-pending')).toBe('false');
  });
});

describe('customer theme contract', () => {
  it('updates standalone waiting timing tokens in place and reconnects after inactive', async () => {
    vi.useFakeTimers();
    const view = (ms: number, active = true) => <ThinkingIndicator active={active} tokens={{ waitingMessageMs: ms }} messages={['One', 'Two', 'Three']} />;
    const { container, rerender } = render(view(1000));
    const status = container.firstElementChild;
    tick(1000);
    expect(container.textContent).toBe('Two');
    await act(async () => rerender(view(2000)));
    expect(container.firstElementChild).toBe(status);
    tick(1000);
    expect(container.textContent).toBe('Two');
    tick(1000);
    expect(container.textContent).toBe('Three');
    rerender(view(1000, false));
    expect(container.textContent).toBe('');
    expect(vi.getTimerCount()).toBe(0);
    rerender(view(1000));
    tick(1000);
    expect(container.textContent).toBe('One');
  });

  it('switches the complete theme without replacing the response or mutating content', () => {
    const first = createMotionTokens('#184c8c', { panelRadius: 0, responseShadow: 'none', conversationMaxWidth: 1000 });
    const second = createMotionTokens('#8a682f', { panelRadius: 12, responseShadow: '0 4px 16px #0002', conversationMaxWidth: 880 });
    const view = (tokens: typeof first) => <MotionTheme tokens={tokens}><MarkdownResponse text="Saved answer" phase="complete" /></MotionTheme>;
    const { container, rerender } = render(view(first));
    const surface = container.querySelector('.cm-response');
    const theme = container.firstElementChild as HTMLElement;
    expect(theme.style.getPropertyValue('--cm-panel-radius')).toBe('0px');
    rerender(view(second));
    expect(container.querySelector('.cm-response')).toBe(surface);
    expect(theme.style.getPropertyValue('--cm-accent')).toBe('#8a682f');
    expect(theme.style.getPropertyValue('--cm-response-surface')).toBe(second.responseSurfaceColor);
    expect(theme.style.getPropertyValue('--cm-panel-radius')).toBe('12px');
    expect(theme.style.getPropertyValue('--cm-conversation-max-width')).toBe('880px');
    expect(surface?.getAttribute('style')).toBeNull();
    expect(container.textContent).toBe('Saved answer');
  });

  it('bounds timings/layout and refuses unsafe shadow/font CSS', () => {
    const style = motionTokens({ conversationMaxWidth: 1, messageGap: -10, revealCharactersPerSecond: 99999,
      revealTailMs: -1, waitingVariantMs: Infinity, responseTransitionMs: 99999,
      responseShadow: 'url(https://example.com)', fontFamily: 'serif; color: red',
      codeFontFamily: 'ui-monospace, monospace', activityDotOpacity: 2 });
    expect(style).toMatchObject({ '--cm-conversation-max-width': '240px', '--cm-message-gap': '0px',
      '--cm-reveal-rate': '2000', '--cm-reveal-tail': '0ms', '--cm-response-transition': '3000ms', '--cm-activity-dot-opacity': '1' });
    expect(style['--cm-response-shadow']).toBeUndefined();
    expect(style['--cm-font-family']).toBeUndefined();
    expect(style['--cm-waiting-variant']).toBeUndefined();
  });

  it('uses timing tokens for waiting rotation and display pacing', () => {
    vi.useFakeTimers();
    const tokens = { waitingMessageMs: 1000, waitingVariantMs: 2000, revealCharactersPerSecond: 1, revealTailMs: 0 };
    const { container, rerender } = render(<ChatResponse text="" phase="waiting" presentation tokens={tokens} waiting={{ messages: ['One', 'Two'] }} />);
    tick(1000);
    expect(container.textContent).toBe('Two');
    rerender(<ChatResponse text={'Answer '.repeat(100)} phase="streaming" presentation tokens={tokens} />);
    tick(40);
    expect(container.querySelector('.cm-response-text')?.textContent).toBe('A');
    rerender(<ChatResponse text={'Answer '.repeat(100)} phase="complete" presentation tokens={tokens} />);
    tick(40);
    expect(container.querySelector('.cm-response')?.getAttribute('data-presentation-pending')).toBe('false');
  });
});

describe('Markdown tail placement', () => {
  it.each(['Hello **world**', '# Title', '- First\n  - Last', '- First\n\n  Last paragraph', '```ts\nconst x = 1;\n```', '| A | B |\n|---|---|\n| 1 | 2 |'])('places one tail inside the final block: %s', text => {
    const { container } = render(<StreamingMarkdown text={text} />);
    const cursor = container.querySelector('.cm-markdown-cursor');
    expect(container.querySelectorAll('.cm-markdown-cursor')).toHaveLength(1);
    expect(cursor?.parentElement?.className).not.toBe('cm-markdown');
  });
});
