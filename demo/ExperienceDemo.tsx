import { useEffect, useState } from 'react';
import { ChatConversation, ChatResponse, MotionTheme, createMotionTokens, darkTokens, type ResponsePhase } from '../src/index.js';
import { StreamingMarkdown } from '../src/markdown.js';
import { customerThemes } from '../examples/customerThemes.js';

const reply = '### 本周概览\n\n三个示例分组的进度都在稳步推进。**B 组完成量最高**，A 组次之。\n\n| 分组 | 完成量 |\n|---|---|\n| A | 24 |\n| B | 36 |\n| C | 18 |\n\n- 先查看分组变化\n- 再补充需要跟进的事项\n\n所有内容均为本地合成示例。';
const phases: [ResponsePhase, string][] = [['waiting', '等待'], ['thinking', '阶段'], ['streaming', '流式回复'], ['complete', '完成'], ['error', '中断'], ['cancelled', '取消'], ['incomplete', '未完成']];

function ExampleChart() {
  return <figure className="experience-chart" aria-label="合成分组完成量图表">
    <figcaption>可选图表插槽 <span>LOCAL SAMPLE</span></figcaption>
    <svg viewBox="0 0 440 100" role="img" aria-label="A 组 24，B 组 36，C 组 18">
      {[24, 36, 18].map((value, index) => <g key={index} transform={`translate(0 ${index * 32})`}>
        <text x="0" y="19">{String.fromCharCode(65 + index)}</text><rect x="32" y="4" width={value * 9} height="20" fill="var(--cm-accent)" opacity={1 - index * .17} /><text x={value * 9 + 42} y="19">{value}</text>
      </g>)}
    </svg>
  </figure>;
}

export default function ExperienceDemo({ paused = false }: { paused?: boolean }) {
  const [customer, setCustomer] = useState<keyof typeof customerThemes>('navy');
  const [accent, setAccent] = useState('#184c8c');
  const [phase, setPhase] = useState<ResponsePhase>('thinking');
  const [text, setText] = useState('');
  const [run, setRun] = useState(1);
  const [chart, setChart] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [markdown, setMarkdown] = useState(true);
  const [pace, setPace] = useState(true);
  const tokens = { ...customerThemes[customer], ...createMotionTokens(accent), ...(customer === 'dark' ? {
    ...darkTokens, linkColor: '#8ecbef', codeBackgroundColor: '#122132', codeTextColor: '#d3e6f6',
  } : {}) };
  useEffect(() => {
    if (phase !== 'streaming') return;
    let count = 0;
    const glyphs = Array.from(reply);
    const timer = window.setInterval(() => {
      count += 4;
      setText(glyphs.slice(0, count).join(''));
      if (count >= glyphs.length) { window.clearInterval(timer); setPhase('complete'); }
    }, 48);
    return () => window.clearInterval(timer);
  }, [phase, run]);
  const select = (next: ResponsePhase) => {
    setRun(value => value + 1); setPhase(next);
    setText(next === 'complete' ? reply : ['error', 'cancelled', 'incomplete'].includes(next) ? '已保留收到的部分回复。' : '');
  };
  return <section id="experience" className="section experience-section">
    <div className="section-heading"><div><p className="eyebrow">ONE ACCENT. THE WHOLE CONVERSATION.</p><h2>把完整的回复体验带走。</h2></div><p>公开阶段、正文、可选结果，自由组合。<br />这里只使用本地合成内容，没有服务端连接。</p></div>
    <div className="experience-controls">
      <label>客户主题 <select aria-label="客户主题" value={customer} onChange={event => {
        const next = event.target.value as keyof typeof customerThemes;
        setCustomer(next); setAccent(customerThemes[next].accentColor!);
      }}><option value="navy">深蓝 · 方角</option><option value="warm">暖金 · 柔和</option><option value="dark">深色 · 夜间</option></select></label>
      <label>主色 token <input type="color" aria-label="聊天体验主色" value={accent} onChange={event => setAccent(event.target.value)} /></label>
      <label><input type="checkbox" checked={showActivity} onChange={event => setShowActivity(event.target.checked)} />阶段面板</label>
      <label><input type="checkbox" checked={markdown} onChange={event => setMarkdown(event.target.checked)} />Markdown</label>
      <label><input type="checkbox" checked={chart} onChange={event => setChart(event.target.checked)} />图表插槽</label>
      <label><input type="checkbox" checked={pace} onChange={event => setPace(event.target.checked)} />展示缓冲</label>
    </div>
    <div className="experience-layout">
      <div className="experience-preview">
        <MotionTheme tokens={tokens}>
          <ChatConversation style={{ height: 'min(70vh, 760px)' }} followKey={run} resumeLabel="回到最新回答">
          <div className="experience-user">总结一下示例分组的本周进展。</div>
          <ChatResponse responseId={String(run)} text={text} phase={phase} paused={paused} presentation={pace} surface="completion"
            labels={{ waiting: '正在等待回复', thinking: '正在整理信息', streaming: '正在组织回复', complete: '回答已完成',
              presenting: '正在呈现回答', error: '回复已中断', cancelled: '已取消', incomplete: '回答未完成' }}
            waiting={{ messages: ['正在准备回复', '正在处理你的请求', '即将开始输出'] }}
            activity={showActivity ? { runId: String(run), summaryLabel: '公开摘要',
              summary: '读取示例分组，并组织成便于阅读的概览。', steps: [
                { id: 'context', label: '理解请求', state: 'complete', duration: '0.2s' },
                { id: 'organize', label: '整理示例内容', state: phase === 'thinking' ? 'running' : 'complete', variant: 'solving' },
                ...(phase === 'thinking' || phase === 'waiting' ? [] : [{ id: 'reply', label: '组织回复', state: phase === 'error' || phase === 'incomplete' ? 'error' as const : phase === 'cancelled' ? 'cancelled' as const : phase === 'complete' ? 'complete' as const : 'running' as const, variant: 'composing' as const }]),
              ] } : undefined}
            renderText={markdown ? props => <StreamingMarkdown {...props} /> : undefined}
            result={chart ? <ExampleChart /> : undefined} />
          </ChatConversation>
        </MotionTheme>
      </div>
      <aside className="experience-settings">
        <span className="eyebrow">PUBLIC STATE / 公开状态</span>
        <div className="experience-phases">{phases.map(([value, label]) => <button type="button" key={value} aria-pressed={phase === value} onClick={() => select(value)}>{label}</button>)}</div>
        <pre>{`const tokens = createMotionTokens('${accent}', {\n  panelRadius: ${tokens.panelRadius},\n  conversationMaxWidth: ${tokens.conversationMaxWidth},\n  orbSize: ${tokens.orbSize}\n});\n\n<MotionTheme tokens={tokens}>\n  <ChatConversation followKey={submissionId}>\n    <MarkdownResponse\n      responseId={reply.id}\n      text={reply.text}\n      phase={reply.phase}\n      result={optionalChart}\n    />\n  </ChatConversation>\n</MotionTheme>`}</pre>
        <p>图表、附件和操作区都是插槽。组件不请求模型，不推断后台阶段。</p>
      </aside>
    </div>
  </section>;
}
