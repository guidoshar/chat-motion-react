'use client';

import { useId, useState, type ReactNode } from 'react';
import { StatusPill } from './StatusPill.js';
import { TransitionOrb } from './TransitionOrb.js';
import { motionTokens, type MotionTokens, type MotionStyle } from './tokens.js';
import type { OrbVariant } from './orbGeometry.js';
import { useMotionEnvironment } from './useMotionEnvironment.js';

export type ActivityState = 'running' | 'complete' | 'error' | 'cancelled';
export interface ActivityStep {
  id: string;
  label: string;
  state: ActivityState | 'pending' | 'skipped';
  description?: ReactNode;
  duration?: string;
  variant?: OrbVariant;
}
export interface ActivityPanelProps {
  /** Change for a new request to reset manual expansion. */
  runId?: string;
  label: string;
  state?: ActivityState;
  steps?: readonly ActivityStep[];
  /** An application-approved public summary, never private model reasoning. */
  summary?: ReactNode;
  summaryLabel?: string;
  elapsed?: string;
  variant?: OrbVariant;
  historical?: boolean;
  paused?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  announce?: boolean;
  tokens?: MotionTokens;
  style?: MotionStyle;
  className?: string;
  children?: ReactNode;
}

/** Controlled or automatic disclosure; stages and timing come entirely from the caller. */
export function ActivityPanel({ runId = 'default', label, state = 'running', steps = [], summary,
  summaryLabel = 'Summary', elapsed, variant = 'solving', historical = false, paused = false,
  expanded, onExpandedChange, announce = true, tokens, style, className = '', children }: ActivityPanelProps) {
  const bodyId = useId();
  const quiet = useMotionEnvironment();
  const running = state === 'running' && !historical;
  const [choice, setChoice] = useState({ runId, running, open: running });
  if (choice.runId !== runId || choice.running !== running) setChoice({ runId, running, open: running });
  const open = expanded ?? choice.open;
  const stopped = paused || quiet || historical;
  const status = state === 'complete' ? 'success' : state === 'cancelled' ? 'idle' : state === 'error' ? 'error' : 'running';
  return <section className={`cm-activity ${className}`} data-state={state} data-motion-paused={stopped}
    style={{ ...motionTokens(tokens), ...style }} aria-label={label}>
    <button type="button" className="cm-activity-heading" aria-expanded={open} aria-controls={bodyId} onClick={() => {
      setChoice({ runId, running, open: !open });
      onExpandedChange?.(!open);
    }}>
      <StatusPill label={label} status={status} variant={variant} transition animatedLabel
        announce={announce && !historical} paused={stopped} />
      {elapsed && <span className="cm-activity-time">{elapsed}</span>}
      <span className="cm-activity-chevron" aria-hidden="true">⌄</span>
    </button>
    <div id={bodyId} className="cm-collapse" data-expanded={open} aria-hidden={!open}
      ref={node => { node?.toggleAttribute('inert', !open); }}>
      <div className="cm-collapse-clip"><div className="cm-activity-body">
        {summary && <div className="cm-activity-summary"><strong>{summaryLabel}</strong><div>{summary}</div></div>}
        {steps.length > 0 && <ol className="cm-activity-steps">
          {steps.map(step => <li key={step.id} data-state={step.state}>
            <span className="cm-activity-step-icon" aria-hidden="true">
              {step.state === 'running' ? <TransitionOrb variant={step.variant ?? 'band'} size={22} density={.6}
                paused={stopped || !open} /> : step.state === 'complete' ? '✓' : step.state === 'error' ? '!' : '·'}
            </span>
            <span className="cm-activity-step-copy"><span>{step.label}</span>{step.description && <small>{step.description}</small>}</span>
            {step.duration && <span className="cm-activity-time">{step.duration}</span>}
          </li>)}
        </ol>}
        {children}
      </div></div>
    </div>
  </section>;
}
