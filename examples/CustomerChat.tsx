import type { ReactNode } from 'react';
import { ChatConversation, MotionTheme, type ActivityStep, type ResponsePhase } from '@guidoshar/chat-motion-react';
import { MarkdownResponse } from '@guidoshar/chat-motion-react/markdown';
import { customerThemes } from './customerThemes.js';
import '@guidoshar/chat-motion-react/styles.css';

interface Reply {
  id: string;
  text: string;
  phase: ResponsePhase;
  historical?: boolean;
  steps?: readonly ActivityStep[];
  result?: ReactNode;
  actions?: ReactNode;
}

/** Your backend supplies replies and public stages. Switching customer changes only tokens. */
export function CustomerChat({ customer = 'navy', replies, submissionId }: {
  customer?: keyof typeof customerThemes;
  replies: readonly Reply[];
  submissionId: string;
}) {
  return <MotionTheme tokens={customerThemes[customer]}>
    <ChatConversation style={{ height: '70vh' }} followKey={submissionId} resumeLabel="Jump to latest">
      {replies.map(reply => <MarkdownResponse key={reply.id} responseId={reply.id}
        text={reply.text} phase={reply.phase} historical={reply.historical}
        activity={reply.steps ? { steps: reply.steps } : undefined}
        result={reply.result} actions={reply.actions} />)}
    </ChatConversation>
  </MotionTheme>;
}
