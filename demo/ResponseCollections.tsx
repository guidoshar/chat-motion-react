import { useEffect, useState } from 'react';
import { ResponseExperience, type ResponsePhase, type ResponsePreset } from '../src/index.js';

const reply = '你好，我是诺小顿。\n已收到你的加工需求。我会先整理关键工况，再把需要确认的信息说明清楚。\n让过程可理解，也让最终的回答自然落定。';
const collections: { id: ResponsePreset; name: string; subtitle: string; description: string; thinking: string; streaming: string; finish: string }[] = [
  { id: 'clear', name: 'Clear', subtitle: '轻盈 · 接近日常 Copilot 质感', description: '把舞台留给内容。干净、舒缓，适合长对话和高频业务界面。', thinking: '单色点阵 + 文字掠光', streaming: '柔和淡入 + 细光束', finish: '轻确认 + 高光淡出' },
  { id: 'aurora', name: 'Aurora', subtitle: '柔光 · 品牌更有存在感', description: '色彩围绕思考，不围绕正文。适合品牌助手与创作场景。', thinking: '分层点阵 + 局部柔光', streaming: '微糊聚焦 + 呼吸色点', finish: '多彩细线轻轻收尾' },
  { id: 'glass', name: 'Glass', subtitle: '磨砂 · 克制的空间层次', description: '只给状态一层玻璃。正文仍然平整清晰，适合工具协同界面。', thinking: '球面扫描 + 磨砂掠光', streaming: '字素渐显 + 短线光标', finish: '玻璃隐退，留下结果' },
];
const phaseNames: Record<ResponsePhase, string> = { thinking: '正在理解你的需求', streaming: '正在整理回答', complete: '已完成', error: '响应暂时中断', idle: '已停止' };

export function ResponseCollections({ paused }: { paused: boolean }) {
  const [phase, setPhase] = useState<ResponsePhase>('thinking');
  const [text, setText] = useState('');
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const [glassBlur, setGlassBlur] = useState(14);
  const [sheenDurationMs, setSheenDuration] = useState(3200);
  const [codePreset, setCodePreset] = useState<ResponsePreset>('clear');
  const [showCode, setShowCode] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  useEffect(() => {
    if (!playing) return;
    setPhase('thinking'); setText('');
    const glyphs = Array.from(reply);
    const started = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - started;
      if (elapsed < 1700) return;
      const count = Math.min(glyphs.length, Math.floor((elapsed - 1700) / 40) + 1);
      setText(glyphs.slice(0, count).join(''));
      if (count === glyphs.length) { setPhase('complete'); setPlaying(false); }
      else setPhase('streaming');
    }, 40);
    return () => window.clearInterval(timer);
  }, [playing, run]);
  const switchPhase = (next: ResponsePhase) => {
    setPlaying(false); setPhase(next);
    if (next === 'thinking') setText('');
    else if (next === 'complete') setText(reply);
    else if (next === 'error') setText(current => current || '已收到你的加工需求。我们会保留已生成的内容，等待继续。');
  };
  const code = `import { ResponseExperience, type ResponsePhase } from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

export function Reply({ text, phase }: { text: string; phase: ResponsePhase }) {
  return (
    <ResponseExperience
      preset="${codePreset}"
      text={text}
      phase={phase}
      tokens={{ glassBlur: ${glassBlur}, sheenDurationMs: ${sheenDurationMs} }}
      announce
    />
  );
}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopyMessage('代码已复制'); }
    catch { setCopyMessage('无法自动复制，请手动选择下面的代码。'); }
  };
  return <section id="collections" className="section collections-section">
    <div className="section-heading"><div><p className="eyebrow">COORDINATED RESPONSE COLLECTIONS / NEW</p><h2>不止思考，还有回应的方式。</h2></div><p>思考、文字显现、光标与完成收尾。<br/>三套完整组合，同一段内容，一起比较。</p></div>
    <div className="collection-toolbar"><div className="collection-play"><button className="primary-button" onClick={() => { setPlaying(true); setRun(value => value + 1); }}>{playing ? '从头播放三套' : '同步体验三套'} <span aria-hidden="true">↗</span></button>{playing && <button onClick={() => switchPhase('idle')}>停止</button>}<span>纯前端模拟，不连接服务</span></div><div className="collection-states" role="group" aria-label="查看响应状态"><button aria-pressed={!playing && phase === 'thinking'} onClick={() => switchPhase('thinking')}>思考</button><button aria-pressed={!playing && phase === 'complete'} onClick={() => switchPhase('complete')}>完成</button><button aria-pressed={!playing && phase === 'error'} onClick={() => switchPhase('error')}>中断</button></div></div>
    <div className="response-collections">{collections.map((item, index) => <article className="collection-card" key={item.id} data-collection={item.id}>
      <div className="collection-card-heading"><span className="collection-index">0{index + 1}</span><div><h3>{item.name}</h3><p>{item.subtitle}</p></div>{item.id === 'clear' && <span className="editor-pick">推荐起点</span>}</div>
      <div className="collection-scene">
        <div className="collection-stage-note"><span>{phase === 'thinking' ? 'THINKING' : phase === 'streaming' ? 'STREAMING' : phase === 'complete' ? 'COMPLETE' : 'PAUSED'}</span><span>诺小顿 · 示例助手</span></div>
        <ResponseExperience key={run} preset={item.id} text={text} phase={phase} label={phaseNames[phase]}
          detail={phase === 'thinking' ? '核对工况与目标，准备下一步' : undefined}
          paused={paused} tokens={{ glassBlur, sheenDurationMs }}/>
        {!text && <div className="collection-placeholder" aria-hidden="true">回答将在这里自然出现。<br/>点击「同步体验三套」比较文字与光标。</div>}
      </div>
      <div className="collection-recipe"><p>{item.description}</p><dl><div><dt>思考</dt><dd>{item.thinking}</dd></div><div><dt>输出</dt><dd>{item.streaming}</dd></div><div><dt>完成</dt><dd>{item.finish}</dd></div></dl><button onClick={() => { setCodePreset(item.id); setShowCode(true); setCopyMessage(''); }}>使用 {item.name} <span aria-hidden="true">→</span></button></div>
    </article>)}</div>
    <div className="collection-settings"><label>状态掠光周期 <output>{(sheenDurationMs / 1000).toFixed(1)}s</output><input aria-label="状态掠光周期" type="range" min="1600" max="6000" step="200" value={sheenDurationMs} onChange={event => setSheenDuration(Number(event.target.value))}/></label><label>Glass 磨砂强度 <output>{glassBlur}px</output><input aria-label="Glass 磨砂强度" type="range" min="0" max="24" value={glassBlur} onChange={event => setGlassBlur(Number(event.target.value))}/></label><p>三组共享上方主题与暂停开关。<br/>高光只提示进展，不代表完成百分比。</p></div>
    <p className="sr-only" role="status">{phaseNames[phase]}</p>
    {showCode && <div className="collection-code"><div className="code-toolbar"><strong>{codePreset} / ResponseExperience</strong><div><button onClick={copy}>复制代码</button><button aria-label="关闭组合代码" onClick={() => setShowCode(false)}>关闭</button></div></div><pre><code>{code}</code></pre><p role="status">{copyMessage}</p></div>}
    <p className="collection-disclaimer">Clear 借鉴轻盈的响应节奏，不是 Microsoft / Copilot 官方组件或复刻实现。Glass 在不支持模糊或减少透明效果时回退为实色；减少动态效果时不播放高光和文字动画。</p>
  </section>;
}
