'use client';

import { useContext, useId, useState, type ReactNode } from 'react';
import { StatusPill } from './StatusPill.js';
import { TransitionOrb } from './TransitionOrb.js';
import { motionTokens, type MotionTokens, type MotionStyle } from './tokens.js';
import type { OrbVariant } from './orbGeometry.js';
import { useMotionEnvironment } from './useMotionEnvironment.js';
import { ChatScrollPauseContext } from './useChatAutoScroll.js';

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
  /** Automatic disclosure until the user chooses. A new runId resets the choice. */
  autoExpanded?: boolean;
  /** A single header orb and static step markers are the default. */
  transition?: boolean;
  stepIndicators?: 'dots' | 'orbs';
  announce?: boolean;
  tokens?: MotionTokens;
  style?: MotionStyle;
  className?: string;
  children?: ReactNode;
}

/** Controlled or automatic disclosure; stages and timing come entirely from the caller. */
export function ActivityPanel({ runId = 'default', label, state = 'running', steps = [], summary,
  summaryLabel = 'Summary', elapsed, variant = 'solving', historical = false, paused = false,
  expanded, onExpandedChange, autoExpanded, transition = false, stepIndicators = 'dots',
  announce = true, tokens, style, className = '', children }: ActivityPanelProps) {
  const bodyId = useId();
  const quiet = useMotionEnvironment();
  const running = state === 'running' && !historical;
  const pauseFollowing = useContext(ChatScrollPauseContext);
  const [choice, setChoice] = useState<{ runId: string; open?: boolean }>({ runId });
  if (choice.runId !== runId) setChoice({ runId });
  const manual = choice.runId === runId ? choice.open : undefined;
  const open = expanded ?? manual ?? (!historical && (autoExpanded ?? running));
  const stopped = paused || quiet || historical;
  const status = state === 'complete' ? 'success' : state === 'cancelled' ? 'idle' : state === 'error' ? 'error' : 'running';
  return <section className={`cm-activity ${className}`} data-state={state} data-motion-paused={stopped}
    style={{ ...motionTokens(tokens), ...style }} aria-label={label}>
    <button type="button" className="cm-activity-heading" aria-expanded={open} aria-controls={bodyId} onClick={() => {
      pauseFollowing();
      setChoice({ runId, open: !open });
      onExpandedChange?.(!open);
    }}>
      <StatusPill label={label} status={status} variant={variant} transition={transition} animatedLabel
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
              {step.state === 'running' ? stepIndicators === 'orbs' ? <TransitionOrb variant={step.variant ?? 'band'} size={22} density={.6}
                paused={stopped || !open} /> : <i className="cm-activity-step-dot" /> : step.state === 'complete' ? '✓' : step.state === 'error' ? '!' : '·'}
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
