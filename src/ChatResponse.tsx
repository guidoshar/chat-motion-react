'use client';

import { useRef, type ReactNode } from 'react';
import { ActivityPanel, type ActivityPanelProps } from './ActivityPanel.js';
import { useWaitingState, type ThinkingIndicatorProps } from './ThinkingIndicator.js';
import { StatusPill } from './StatusPill.js';
import { StreamingText, type StreamingTextProps } from './StreamingText.js';
import { motionTokens, type MotionTokens, type MotionStyle } from './tokens.js';
import { useMotionEnvironment } from './useMotionEnvironment.js';
import { useStreamingReveal, type StreamingRevealOptions } from './useStreamingReveal.js';
import { useChatTiming } from './useChatTiming.js';

export type ResponsePhase = 'waiting' | 'thinking' | 'streaming' | 'complete' | 'error' | 'cancelled' | 'incomplete';
export type ResponseLabel = ResponsePhase | 'presenting';
const labels: Record<ResponseLabel, string> = {
  waiting: 'Preparing a response', thinking: 'Working on your request', streaming: 'Responding',
  complete: 'Response complete', error: 'Response interrupted', cancelled: 'Response cancelled',
  incomplete: 'Response incomplete', presenting: 'Finishing the response display',
};
export interface ChatResponseProps {
  /** Stable request identity. Change for a new reply to reset presentation and disclosure. */
  responseId?: string;
  text: string;
  phase?: ResponsePhase;
  historical?: boolean;
  paused?: boolean;
  labels?: Partial<Record<ResponseLabel, string>>;
  waiting?: Omit<ThinkingIndicatorProps, 'active' | 'paused' | 'tokens'>;
  activity?: Omit<ActivityPanelProps, 'state' | 'historical' | 'paused' | 'tokens' | 'label'> & { label?: string };
  /** Opt-in buffer; explicit options override inherited timing tokens. */
  presentation?: boolean | Pick<StreamingRevealOptions, 'charactersPerSecond' | 'maxTailMs'>;
  /** Completion adds a surface only after success AND the display buffer drains. */
  surface?: 'plain' | 'completion';
  /** Optional Markdown or custom renderer; plain streamed text works without dependencies. */
  renderText?: (props: Pick<StreamingTextProps, 'text' | 'phase' | 'paused'>) => ReactNode;
  /** Optional chart/table/attachment. No charting package is required. */
  result?: ReactNode;
  actions?: ReactNode;
  /** Results normally appear once presentation is complete. */
  resultWhen?: 'complete' | 'terminal' | 'always';
  tokens?: MotionTokens;
  style?: MotionStyle;
  className?: string;
}

export function ChatResponse(props: ChatResponseProps) {
  return <ResponseView key={props.responseId ?? 'default'} {...props} />;
}

function ResponseView({ responseId, text, phase = 'streaming', historical = false, paused = false, labels: customLabels,
  waiting, activity, renderText, result, actions, resultWhen = 'complete', presentation = false, surface = 'plain',
  tokens, style, className = '' }: ChatResponseProps) {
  const host = useRef<HTMLDivElement>(null);
  const timing = useChatTiming(host);
  const quiet = useMotionEnvironment();
  const terminal = ['complete', 'error', 'cancelled', 'incomplete'].includes(phase);
  const mountedTerminal = useRef(terminal).current;
  const history = historical || mountedTerminal;
  const interrupted = ['error', 'cancelled', 'incomplete'].includes(phase);
  const stopped = paused || quiet || history;
  const display = useStreamingReveal({ id: responseId, text, complete: phase === 'complete',
    historical: history, interrupted, enabled: Boolean(presentation) && !paused,
    charactersPerSecond: timing.charactersPerSecond, maxTailMs: timing.maxTailMs,
    ...(typeof presentation === 'object' ? presentation : {}) });
  const presenting = phase === 'complete' && display.pending;
  const textPhase = history || interrupted ? 'idle' : display.complete ? 'settled' : 'writing';
  const labelKey = presenting ? 'presenting' : phase;
  const label = customLabels?.[labelKey] ?? labels[labelKey];
  const waitingState = useWaitingState({
    messages: customLabels?.waiting ? [customLabels.waiting] : undefined,
    messageIntervalMs: timing.messageIntervalMs, variantIntervalMs: timing.variantIntervalMs, ...waiting,
    active: phase === 'waiting' && !history, paused: stopped,
  });
  const { messages: _messages, variants: _variants, messageIntervalMs: _messageMs, variantIntervalMs: _variantMs,
    ...waitingVisual } = waiting ?? {};
  const statusLabel = phase === 'waiting' && !history ? waitingState.label : label;
  const variant = phase === 'waiting' ? waitingState.variant : phase === 'streaming' || presenting ? 'composing' : 'solving';
  const showResult = resultWhen === 'always' || (resultWhen === 'terminal' ? terminal && !display.pending : display.complete);
  return <div ref={host} className={`cm-response ${className}`} data-phase={phase} data-motion-paused={stopped}
    data-surface={surface} data-framed={surface === 'completion' && display.complete} data-presentation-pending={display.pending}
    aria-busy={!terminal || display.pending}
    style={{ ...motionTokens(tokens), ...style }}>
    {activity ? <ActivityPanel runId={responseId} autoExpanded={!text && !terminal} variant={variant}
        announce={phase === 'waiting' ? waiting?.announce ?? false : true}
        {...activity} label={presenting ? label : activity.label ?? statusLabel}
        state={phase === 'error' || phase === 'incomplete' ? 'error' : phase === 'cancelled' ? 'cancelled' : display.complete ? 'complete' : 'running'}
        historical={history} paused={stopped} />
      : !historical && (phase !== 'complete' || presenting) && <StatusPill {...(phase === 'waiting' ? waitingVisual : {})} label={statusLabel} variant={variant}
        transition={waiting?.transition ?? false} animatedLabel
        status={phase === 'error' || phase === 'incomplete' ? 'error' : phase === 'cancelled' ? 'idle' : 'running'}
        paused={stopped} announce={phase === 'waiting' ? waiting?.announce ?? false : true} />}
    {display.text && <div className="cm-response-text">
      {renderText ? renderText({ text: display.text, phase: textPhase, paused: stopped }) : <StreamingText text={display.text} phase={textPhase} paused={stopped} />}
    </div>}
    {showResult && result && <div className="cm-response-result">{result}</div>}
    {terminal && !display.pending && actions && <div className="cm-response-actions">{actions}</div>}
  </div>;
}
