import type { ReactNode } from 'react';
import {
  ChatResponse, MotionTheme, createMotionTokens,
  type ActivityStep, type ResponsePhase,
} from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

const tokens = createMotionTokens('#486b88', { panelRadius: 12, responseFontSize: 16 });

/** Pass accumulated text and public stages from your own transport/state machine. */
export function ChatExperience({ text, phase, steps, result }: {
  text: string;
  phase: ResponsePhase;
  steps: readonly ActivityStep[];
  result?: ReactNode;
}) {
  return <MotionTheme tokens={tokens}>
    <ChatResponse text={text} phase={phase}
      waiting={{ messages: ['Preparing a response', 'Your request is still being processed'] }}
      activity={{ label: phase === 'complete' ? 'Response ready' : 'Request progress', steps }}
      result={result} />
  </MotionTheme>;
}
