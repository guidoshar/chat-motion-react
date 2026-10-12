'use client';

import { useEffect, useRef, useState } from 'react';
import { StatusPill, StreamingText } from '@guidoshar/chat-motion-react';
// Import '@guidoshar/chat-motion-react/styles.css' once at your application's entry.

/** Native EventSource example. See README for the exact event contract and limitations. */
export function SseReply({ url = '/api/chat/stream' }: { url?: string }) {
  const connection = useRef<EventSource | null>(null);
  const [run, setRun] = useState(0);
  const [text, setText] = useState('');
  const [stage, setStage] = useState('等待开始');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'idle' | 'writing' | 'settled'>('idle');

  useEffect(() => {
    if (!run) return;
    setText(''); setError(''); setStage('正在连接'); setBusy(true); setPhase('idle');
    const stream = new EventSource(url);
    connection.current = stream;
    let closed = false;
    const close = () => {
      closed = true;
      stream.close();
      if (connection.current === stream) connection.current = null;
    };
    const fail = (message: string) => {
      if (closed) return;
      close(); setBusy(false); setPhase('idle'); setStage('生成中断'); setError(message);
    };
    const payload = (event: MessageEvent): Record<string, unknown> => {
      const value: unknown = JSON.parse(event.data);
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid event');
      return value as Record<string, unknown>;
    };
    stream.addEventListener('stage', event => {
      if (closed) return;
      try {
        const data = payload(event);
        if (typeof data.label !== 'string') throw new Error('Missing label');
        setStage(data.label);
      } catch { fail('阶段消息格式不正确。'); }
    });
    stream.addEventListener('delta', event => {
      if (closed) return;
      try {
        const data = payload(event);
        if (typeof data.text !== 'string') throw new Error('Missing text');
        const delta = data.text;
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
    connection.current?.close(); connection.current = null;
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
