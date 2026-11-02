'use client';

import type { ReactNode } from 'react';
import { ActivityPanel, type ActivityPanelProps } from './ActivityPanel.js';
import { ThinkingIndicator, type ThinkingIndicatorProps } from './ThinkingIndicator.js';
import { StatusPill } from './StatusPill.js';
import { StreamingText, type StreamingTextProps } from './StreamingText.js';
import { motionTokens, type MotionTokens, type MotionStyle } from './tokens.js';
import { useMotionEnvironment } from './useMotionEnvironment.js';

export type ResponsePhase = 'waiting' | 'thinking' | 'streaming' | 'complete' | 'error' | 'cancelled';
const labels: Record<ResponsePhase, string> = {
  waiting: 'Preparing a response', thinking: 'Working on your request', streaming: 'Responding',
  complete: 'Response complete', error: 'Response interrupted', cancelled: 'Response cancelled',
};
export interface ChatResponseProps {
  text: string;
  phase?: ResponsePhase;
  historical?: boolean;
  paused?: boolean;
  labels?: Partial<Record<ResponsePhase, string>>;
  waiting?: Omit<ThinkingIndicatorProps, 'active' | 'paused' | 'tokens'>;
  activity?: Omit<ActivityPanelProps, 'state' | 'historical' | 'paused' | 'tokens'>;
  /** Optional Markdown or custom renderer; plain streamed text works without dependencies. */
  renderText?: (props: Pick<StreamingTextProps, 'text' | 'phase' | 'paused'>) => ReactNode;
  /** Optional chart/table/attachment. No charting package is required. */
  result?: ReactNode;
  actions?: ReactNode;
  /** Results normally appear once presentation is complete. */
  resultWhen?: 'complete' | 'always';
  tokens?: MotionTokens;
  style?: MotionStyle;
  className?: string;
}

export function ChatResponse({ text, phase = 'streaming', historical = false, paused = false, labels: customLabels,
  waiting, activity, renderText, result, actions, resultWhen = 'complete', tokens, style, className = '' }: ChatResponseProps) {
  const quiet = useMotionEnvironment();
  const stopped = paused || quiet || historical;
  const terminal = ['complete', 'error', 'cancelled'].includes(phase);
  const textPhase = historical || phase === 'error' || phase === 'cancelled' ? 'idle' : phase === 'complete' ? 'settled' : 'writing';
  const label = customLabels?.[phase] ?? labels[phase];
  return <div className={`cm-response ${className}`} data-phase={phase} data-motion-paused={stopped}
    style={{ ...motionTokens(tokens), ...style }}>
    {!historical && phase === 'waiting' ? <ThinkingIndicator messages={customLabels?.waiting ? [customLabels.waiting] : undefined} {...waiting} paused={stopped} />
      : activity ? <ActivityPanel {...activity} state={phase === 'error' || phase === 'cancelled' ? phase : terminal ? 'complete' : 'running'}
        historical={historical} paused={stopped} />
      : !historical && phase !== 'complete' && <StatusPill label={label} transition variant={phase === 'streaming' ? 'composing' : 'solving'}
        status={phase === 'error' ? 'error' : phase === 'cancelled' ? 'idle' : 'running'} paused={stopped} announce />}
    {text && <div className="cm-response-text">
      {renderText ? renderText({ text, phase: textPhase, paused: stopped }) : <StreamingText text={text} phase={textPhase} paused={stopped} />}
    </div>}
    {(terminal || historical || resultWhen === 'always') && <>
      {result && <div className="cm-response-result">{result}</div>}
      {actions && <div className="cm-response-actions">{actions}</div>}
    </>}
  </div>;
}
