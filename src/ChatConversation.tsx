'use client';

import type { HTMLAttributes } from 'react';
import { ChatScrollPauseContext, useChatAutoScroll, type ChatAutoScrollOptions } from './useChatAutoScroll.js';

export interface ChatConversationProps extends HTMLAttributes<HTMLDivElement>, ChatAutoScrollOptions {
  contentClassName?: string;
  /** Optional resume button. Omit to keep the viewport free of controls. */
  resumeLabel?: string;
}

/** Give this viewport a bounded height in your layout. It never scrolls the document. */
export function ChatConversation({ children, followKey, bottomThreshold, className = '', contentClassName = '', resumeLabel,
  onScroll, onWheel, onPointerDown, onTouchStart, onTouchMove, onKeyDown, ...props }: ChatConversationProps) {
  const scroll = useChatAutoScroll(children, { followKey, bottomThreshold });
  return <ChatScrollPauseContext.Provider value={scroll.pauseFollowing}>
    <div {...props} className={`cm-conversation ${className}`} ref={scroll.scrollRef}
      role={props.role ?? 'region'} aria-label={props['aria-label'] ?? 'Conversation'} tabIndex={props.tabIndex ?? 0}
      onScroll={event => { scroll.onScroll(); onScroll?.(event); }}
      onWheel={event => { scroll.onWheel(event); onWheel?.(event); }}
      onPointerDown={event => { scroll.onPointerDown(); onPointerDown?.(event); }}
      onTouchStart={event => { scroll.onTouchStart(event); onTouchStart?.(event); }}
      onTouchMove={event => { scroll.onTouchMove(event); onTouchMove?.(event); }}
      onKeyDown={event => { scroll.onKeyDown(event); onKeyDown?.(event); }}>
      <div className={`cm-conversation-content ${contentClassName}`} ref={scroll.contentRef}>{children}</div>
      {resumeLabel && !scroll.isFollowing && <div className="cm-conversation-resume"><button type="button" onClick={scroll.follow}>{resumeLabel}</button></div>}
    </div>
  </ChatScrollPauseContext.Provider>;
}
