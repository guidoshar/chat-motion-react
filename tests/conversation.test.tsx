import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActivityPanel, ChatConversation } from '../src/index.js';
import { StrictMode } from 'react';

afterEach(() => vi.unstubAllGlobals());

function harness() {
  let resize = () => {};
  let nextFrame = 0;
  const frames = new Map<number, FrameRequestCallback>();
  const disconnect = vi.fn();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++nextFrame, callback); return nextFrame; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    disconnect = disconnect;
  });
  const flush = () => act(() => { for (const [id, callback] of [...frames]) { frames.delete(id); callback(0); } });
  return { resize: () => act(resize), flush, frames, disconnect };
}

describe('conversation reading position', () => {
  it('follows measured growth, pauses for reading/inspection, and resumes on submission or the button', () => {
    const engine = harness();
    const wheel = vi.fn();
    const view = (id: string, text: string) => <ChatConversation followKey={id} resumeLabel="Latest" onWheel={wheel}>
      <p>{text}</p><ActivityPanel label="Details" state="complete" />
    </ChatConversation>;
    const { rerender, unmount } = render(view('one', 'First'));
    const viewport = screen.getByRole('region', { name: 'Conversation' });
    let height = 1000;
    Object.defineProperties(viewport, { scrollHeight: { get: () => height }, clientHeight: { value: 400 } });
    engine.flush();
    expect(viewport.scrollTop).toBe(600);
    height = 1200;
    engine.resize(); engine.flush();
    expect(viewport.scrollTop).toBe(800);
    fireEvent.wheel(viewport, { deltaY: -5 });
    expect(wheel).toHaveBeenCalledOnce();
    viewport.scrollTop = 700;
    height = 1400;
    rerender(view('one', 'More text'));
    engine.resize(); engine.flush();
    expect(viewport.scrollTop).toBe(700);
    expect(screen.getByRole('button', { name: 'Latest' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Latest' })); engine.flush();
    expect(viewport.scrollTop).toBe(1000);
    fireEvent.click(screen.getByRole('button', { name: /Details/ }));
    height = 1600;
    engine.resize(); engine.flush();
    expect(viewport.scrollTop).toBe(1000);
    rerender(view('two', 'New request')); engine.flush();
    expect(viewport.scrollTop).toBe(1200);
    height = 1800; engine.resize();
    unmount();
    expect(engine.frames.size).toBe(0);
    expect(engine.disconnect).toHaveBeenCalled();
  });

  it('recognizes keyboard, touch and pointer intent; edits inside the composer do not pause', () => {
    const engine = harness();
    const { rerender, unmount } = render(<StrictMode><ChatConversation followKey={1}><textarea aria-label="Compose" /></ChatConversation></StrictMode>);
    const viewport = screen.getByRole('region');
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Home' });
    expect(viewport.dataset.following).toBe('true');
    fireEvent.keyDown(viewport, { key: 'PageUp' });
    expect(viewport.dataset.following).toBe('false');
    rerender(<StrictMode><ChatConversation followKey={2}>Next</ChatConversation></StrictMode>);
    fireEvent.touchStart(viewport, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(viewport, { touches: [{ clientY: 130 }] });
    expect(viewport.dataset.following).toBe('false');
    rerender(<StrictMode><ChatConversation followKey={3}>Next</ChatConversation></StrictMode>);
    fireEvent.pointerDown(viewport);
    expect(viewport.dataset.following).toBe('false');
    unmount();
    expect(engine.frames.size).toBe(0);
  });
});
