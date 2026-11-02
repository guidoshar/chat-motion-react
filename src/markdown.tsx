'use client';

import { Children, cloneElement, createContext, isValidElement, useContext, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamingText, type StreamingTextProps } from './StreamingText.js';
import { motionTokens } from './tokens.js';

const Motion = createContext({ phase: 'idle' as 'writing' | 'settled' | 'idle', paused: true, allowImages: false });
function Inline({ children }: { children: ReactNode }) {
  const { phase, paused } = useContext(Motion);
  if (phase !== 'writing') return children;
  return Children.map(children, child => {
    if (typeof child === 'string' && !child.trim()) return child;
    if (typeof child === 'string' || typeof child === 'number') return <StreamingText className="cm-markdown-glyphs" text={String(child)} phase={phase} paused={paused} />;
    if (isValidElement<{ children?: ReactNode }>(child) && typeof child.type === 'string' && child.props.children !== undefined && child.type !== 'code' && child.type !== 'pre') {
      return cloneElement(child, { children: <Inline>{child.props.children}</Inline> });
    }
    return child;
  });
}
const components: Components = {
  p: ({ children }) => <p><Inline>{children}</Inline></p>,
  li: ({ children }) => <li><Inline>{children}</Inline></li>,
  img: function Image({ src, alt, title }) {
    const { allowImages } = useContext(Motion);
    return allowImages ? <img src={src} alt={alt} title={title} loading="lazy" /> : <span>{alt}</span>;
  },
};

/** Optional subpath: install react-markdown + remark-gfm only when this renderer is used.
 * Raw HTML stays disabled; the parser's default URL filtering stays enabled. */
export interface StreamingMarkdownProps extends StreamingTextProps {
  /** Disabled by default to avoid automatic requests to image URLs in untrusted replies. */
  allowImages?: boolean;
}
export function StreamingMarkdown({ text, phase = 'writing', paused = false, tokens, style, className = '', allowImages = false }: StreamingMarkdownProps) {
  return <Motion.Provider value={{ phase, paused, allowImages }}>
    <div className={`cm-markdown ${className}`} style={{ ...motionTokens(tokens), ...style }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>{text}</ReactMarkdown>
      {phase !== 'idle' && <StreamingText text="" phase={phase} paused={paused} className="cm-markdown-cursor" />}
    </div>
  </Motion.Provider>;
}
