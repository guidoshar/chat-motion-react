'use client';

import { useEffect, useRef, useState } from 'react';
import { StatusPill, StreamingText } from '@guidoshar/chat-motion-react';
// Import '@guidoshar/chat-motion-react/styles.css' once at your application's entry.

/** Native EventSource example. See README for the exact event contract and limitations. */
export function SseReply({ url = '/api/chat/stream' }: { url?: string }) {
  const disconnect = useRef<(() => void) | null>(null);
  const [run, setRun] = useState(0);
  const [text, setText] = useState('');
  const [stage, setStage] = useState('等待开始');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'idle' | 'writing' | 'settled'>('idle');

  useEffect(() => {
    if (!run) return;
    setText(''); setError(''); setStage('正在连接'); setBusy(true); setPhase('idle');
    let stream: EventSource;
    try {
      const target = new URL(url, window.location.href);
      if (target.origin !== window.location.origin || !['http:', 'https:'].includes(target.protocol) || target.username || target.password) throw new Error('Same-origin endpoint required');
      stream = new EventSource(target.href);
    } catch {
      setBusy(false); setStage('无法连接'); setError('请配置有效的同源 SSE 地址。');
      return;
    }
    let closed = false;
    let received = 0;
    let idleTimer = 0;
    let totalTimer = 0;
    const close = () => {
      closed = true;
      window.clearTimeout(idleTimer); window.clearTimeout(totalTimer);
      stream.close();
      if (disconnect.current === close) disconnect.current = null;
    };
    disconnect.current = close;
    const fail = (message: string) => {
      if (closed) return;
      close(); setBusy(false); setPhase('idle'); setStage('生成中断'); setError(message);
    };
    const payload = (event: MessageEvent): Record<string, unknown> => {
      if (typeof event.data !== 'string' || event.data.length > 65536) throw new Error('Event too large');
      const value: unknown = JSON.parse(event.data);
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid event');
      return value as Record<string, unknown>;
    };
    const heartbeat = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => fail('等待响应超时，请重试。'), 45000);
    };
    heartbeat();
    totalTimer = window.setTimeout(() => fail('生成超过时间限制，请重试。'), 300000);
    stream.addEventListener('stage', event => {
      if (closed) return;
      try {
        const data = payload(event);
        if (typeof data.label !== 'string' || data.label.length > 160) throw new Error('Invalid label');
        heartbeat();
        setStage(data.label);
      } catch { fail('阶段消息格式不正确。'); }
    });
    stream.addEventListener('delta', event => {
      if (closed) return;
      try {
        const data = payload(event);
        if (typeof data.text !== 'string') throw new Error('Missing text');
        const delta = data.text;
        if (received + delta.length > 200000) { fail('回复超过示例的长度限制。'); return; }
        received += delta.length;
        heartbeat();
        setPhase('writing'); setText(previous => previous + delta);
      } catch { fail('文本消息格式不正确。'); }
    });
    stream.addEventListener('done', () => {
      if (closed) return;
      close(); setBusy(false); setPhase('settled'); setStage('已完成');
    });
    stream.addEventListener('failed', () => fail('服务暂时不可用，请重试。'));
    // Close on transport error: do not silently reconnect and append duplicate deltas.
    stream.onerror = () => fail('连接中断，请重试。');
    return close;
  }, [url, run]);

  const cancel = () => {
    disconnect.current?.();
    setBusy(false); setPhase('idle'); setStage('已停止');
  };
  return <section>
    <button onClick={() => setRun(value => value + 1)} disabled={busy}>开始生成</button>
    <button onClick={cancel} disabled={!busy}>停止</button>
    <div><StatusPill label={stage} status={busy ? 'running' : error ? 'error' : phase === 'settled' ? 'success' : 'idle'} announce/></div>
    <p><StreamingText key={run} text={text} phase={phase}/></p>
    {error && <p role="alert">{error}</p>}
  </section>;
}
