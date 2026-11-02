import { useEffect, useState } from 'react';
import { ChatResponse, MotionTheme, createMotionTokens, useStreamingReveal, type ResponsePhase } from '../src/index.js';
import { StreamingMarkdown } from '../src/markdown.js';

const reply = '### 本周概览\n\n三个示例分组的进度都在稳步推进。**B 组完成量最高**，A 组次之。\n\n| 分组 | 完成量 |\n|---|---|\n| A | 24 |\n| B | 36 |\n| C | 18 |\n\n- 先查看分组变化\n- 再补充需要跟进的事项\n\n所有内容均为本地合成示例。';
const phases: [ResponsePhase, string][] = [['waiting', '等待'], ['thinking', '阶段'], ['streaming', '流式回复'], ['complete', '完成'], ['error', '中断'], ['cancelled', '取消']];

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
  const [accent, setAccent] = useState('#8a682f');
  const [phase, setPhase] = useState<ResponsePhase>('thinking');
  const [text, setText] = useState('');
  const [run, setRun] = useState(1);
  const [chart, setChart] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [markdown, setMarkdown] = useState(true);
  const [pace, setPace] = useState(false);
  const tokens = createMotionTokens(accent, { orbSize: 42, panelRadius: 2, panelPadding: 18, labelSize: 14, gap: 10 });
  const shown = useStreamingReveal({ id: String(run), text, complete: phase === 'complete', interrupted: ['error', 'cancelled'].includes(phase), enabled: pace });
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
    setText(next === 'complete' ? reply : next === 'error' || next === 'cancelled' ? '已保留收到的部分回复。' : '');
  };
  const presentingPhase = phase === 'complete' && shown.pending ? 'streaming' : phase;
  return <section id="experience" className="section experience-section">
    <div className="section-heading"><div><p className="eyebrow">ONE ACCENT. THE WHOLE CONVERSATION.</p><h2>把完整的回复体验带走。</h2></div><p>公开阶段、正文、可选结果，自由组合。<br />这里只使用本地合成内容，没有服务端连接。</p></div>
    <div className="experience-controls">
      <label>主色 token <input type="color" aria-label="聊天体验主色" value={accent} onChange={event => setAccent(event.target.value)} /></label>
      <label><input type="checkbox" checked={showActivity} onChange={event => setShowActivity(event.target.checked)} />阶段面板</label>
      <label><input type="checkbox" checked={markdown} onChange={event => setMarkdown(event.target.checked)} />Markdown</label>
      <label><input type="checkbox" checked={chart} onChange={event => setChart(event.target.checked)} />图表插槽</label>
      <label><input type="checkbox" checked={pace} onChange={event => setPace(event.target.checked)} />展示缓冲</label>
    </div>
    <div className="experience-layout">
      <div className="experience-preview">
        <div className="experience-user">总结一下示例分组的本周进展。</div>
        <MotionTheme tokens={tokens}>
          <ChatResponse text={shown.text} phase={presentingPhase} paused={paused}
            labels={{ thinking: '正在整理信息', streaming: '正在组织回复', error: '回复已中断', cancelled: '已取消' }}
            waiting={{ messages: ['正在准备回复', '正在处理你的请求', '即将开始输出'] }}
            activity={showActivity ? { runId: String(run), label: phase === 'complete' && !shown.pending ? '处理完成' : phase === 'error' ? '回复已中断' : phase === 'cancelled' ? '已取消' : '正在整理信息', summaryLabel: '公开摘要',
              summary: '读取示例分组，并组织成便于阅读的概览。', steps: [
                { id: 'context', label: '理解请求', state: 'complete', duration: '0.2s' },
                { id: 'organize', label: '整理示例内容', state: phase === 'thinking' ? 'running' : 'complete', variant: 'solving' },
                ...(phase === 'thinking' ? [] : [{ id: 'reply', label: '组织回复', state: phase === 'error' ? 'error' as const : phase === 'cancelled' ? 'cancelled' as const : shown.complete ? 'complete' as const : 'running' as const, variant: 'composing' as const }]),
              ] } : undefined}
            renderText={markdown ? props => <StreamingMarkdown {...props} /> : undefined}
            result={chart ? <ExampleChart /> : undefined} />
        </MotionTheme>
      </div>
      <aside className="experience-settings">
        <span className="eyebrow">PUBLIC STATE / 公开状态</span>
        <div className="experience-phases">{phases.map(([value, label]) => <button type="button" key={value} aria-pressed={phase === value} onClick={() => select(value)}>{label}</button>)}</div>
        <pre>{`const tokens = createMotionTokens('${accent}', {\n  panelRadius: 2,\n  orbSize: 42\n});\n\n<MotionTheme tokens={tokens}>\n  <ChatResponse\n    text={text}\n    phase={phase}\n    result={optionalChart}\n  />\n</MotionTheme>`}</pre>
        <p>图表、附件和操作区都是插槽。组件不请求模型，不推断后台阶段。</p>
      </aside>
    </div>
  </section>;
}
