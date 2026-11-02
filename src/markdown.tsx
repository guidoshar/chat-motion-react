'use client';

import { Children, cloneElement, createContext, isValidElement, useContext, type ReactNode } from 'react';
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StreamingText, type StreamingTextProps } from './StreamingText.js';
import { motionTokens } from './tokens.js';
import { ChatResponse, type ChatResponseProps } from './ChatResponse.js';

const Motion = createContext({ phase: 'idle' as 'writing' | 'settled' | 'idle', paused: true, allowImages: false, end: 0 });
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
function Cursor({ node }: ExtraProps) {
  const { phase, paused, end } = useContext(Motion);
  if (phase === 'idle' || (node?.position?.end.offset ?? -1) < end) return null;
  return <StreamingText text="" phase={phase} paused={paused} className="cm-markdown-cursor" />;
}
function Paragraph({ children, node }: { children?: ReactNode } & ExtraProps) {
  return <p><Inline>{children}</Inline><Cursor node={node} /></p>;
}
function ListItem({ children, node }: { children?: ReactNode } & ExtraProps) {
  const blocks = Children.toArray(children).some(child => isValidElement(child)
    && (child.type === Paragraph || child.type === 'ul' || child.type === 'ol'));
  return <li><Inline>{children}</Inline>{!blocks && <Cursor node={node} />}</li>;
}
function Heading({ children, node, level }: { children?: ReactNode; level: 1 | 2 | 3 | 4 | 5 | 6 } & ExtraProps) {
  const Tag = `h${level}` as const;
  return <Tag><Inline>{children}</Inline><Cursor node={node} /></Tag>;
}
const components: Components = {
  p: Paragraph, li: ListItem,
  h1: props => <Heading {...props} level={1} />, h2: props => <Heading {...props} level={2} />,
  h3: props => <Heading {...props} level={3} />, h4: props => <Heading {...props} level={4} />,
  h5: props => <Heading {...props} level={5} />, h6: props => <Heading {...props} level={6} />,
  pre: ({ children, node }) => <pre>{children}<Cursor node={node} /></pre>,
  table: ({ children, node }) => <div className="cm-markdown-table" tabIndex={0}><table>{children}</table><Cursor node={node} /></div>,
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
  return <Motion.Provider value={{ phase, paused, allowImages, end: text.trimEnd().length }}>
    <div className={`cm-markdown ${className}`} style={{ ...motionTokens(tokens), ...style }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>{text}</ReactMarkdown>
    </div>
  </Motion.Provider>;
}

export interface MarkdownResponseProps extends Omit<ChatResponseProps, 'renderText'> {
  markdown?: Pick<StreamingMarkdownProps, 'allowImages'>;
}
/** Ready-to-use composition. Core users still do not load Markdown dependencies. */
export function MarkdownResponse({ markdown, surface = 'completion', presentation = true, ...props }: MarkdownResponseProps) {
  return <ChatResponse {...props} surface={surface} presentation={presentation}
    renderText={textProps => <StreamingMarkdown {...textProps} {...markdown} />} />;
}
