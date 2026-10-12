import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionTheme, ThinkingOrb, StatusPill, StreamingText, darkTokens, type MotionTokens, type OrbVariant, type OrbColorMode } from '../src/index.js';
import '../src/styles.css';
import './styles.css';

const repository = 'https://github.com/guidoshar/chat-motion-react';
const variants: { id: OrbVariant; name: string; description: string; use: string }[] = [
  { id: 'solving', name: 'Solving', description: '分层扭转，打乱再归位。', use: '理解需求 · 规则推演' },
  { id: 'composing', name: 'Composing', description: '固定朝向，思绪随波起伏。', use: '组织内容 · 生成回答' },
  { id: 'ping', name: 'Ping', description: '一束光环，沿球面往返。', use: '检索资料 · 调用工具' },
  { id: 'band', name: 'Band', description: '连续的光带，平静地流转。', use: '通用处理 · 等待响应' },
  { id: 'ribbon', name: 'Ribbon', description: '轻盈的螺旋，保持向前。', use: '汇总分析 · 持续生成' },
];
const presets: Record<string, MotionTokens> = {
  spectrum: { cyan: '#21A8BD', blue: '#1775B9', violet: '#76518C', red: '#DB3B49', orange: '#F28B2C' },
  ocean: { cyan: '#36B8BE', blue: '#176BA0', violet: '#338BBA', red: '#247F98', orange: '#71D1D1' },
  iris: { cyan: '#9087ED', blue: '#6657C4', violet: '#A36CBC', red: '#BB71A0', orange: '#DA9BBD' },
};
type ScenarioId = 'knowledge' | 'selection' | 'quotation';
const scenarios: Record<ScenarioId, { name: string; role: string; request: string; stages: string[]; reply: string; boundary: string }> = {
  knowledge: {
    name: '企业知识检索', role: '知识助手', request: '帮我梳理这款产品的使用条件，并列出需要确认的信息。',
    stages: ['理解问题与使用场景', '检索相关产品资料', '整理可追溯的回答'],
    reply: '可以先从适用材料、工艺条件与质量要求三个方面确认。\n建议补充工件材质、加工方式和目标表面质量，再对照产品资料核对适用范围。\n实际接入时，可在回答旁展示引用来源，帮助使用者继续核验。',
    boundary: '展示“检索 → 整理 → 回答”的交互。组件本身不执行检索，也不生成引用。',
  },
  selection: {
    name: '工业选型', role: '诺小顿 · 选型助手', request: '钢件平面磨削，目标 Ra 0.8，需要补充哪些工况？',
    stages: ['识别材料与加工目标', '核对选型所需参数', '整理下一步确认清单'],
    reply: '已理解你的平面磨削需求与目标粗糙度。\n接下来还需确认工件硬度、砂轮线速度、砂轮厚度和单次加工余量。\n参数齐全后，可将结构化工况交给你现有的规则引擎，匹配候选方案并查看规则依据。',
    boundary: '展示需求澄清与规则引擎的衔接方式。这里没有连接真实选型规则或产品系统。',
  },
  quotation: {
    name: '报价协同', role: '报价助手', request: '选型已确认，能给我一份价格参考吗？',
    stages: ['整理已确认的产品规格', '交接报价协同环节', '生成报价参考摘要'],
    reply: '演示报价参考：¥100.00 / 件。\n这是用于展示协同流程的模拟金额，不是正式报价。\n真实项目可在此接入价格服务，并由业务人员确认数量、税率、运费和有效期。',
    boundary: '纯前端模拟，未接正式报价系统。金额、阶段和结果均为示例，不构成商业承诺。',
  },
};
const stageVariants: OrbVariant[] = ['solving', 'ping', 'composing'];

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;
}
function Demo() {
  const [dark, setDark] = useState(false);
  const [paused, setPaused] = useState(false);
  const [preset, setPreset] = useState('spectrum');
  const [palette, setPalette] = useState<MotionTokens>(presets.spectrum);
  const [variant, setVariant] = useState<OrbVariant>('composing');
  const [size, setSize] = useState(96);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(1);
  const [dotScale, setDotScale] = useState(1);
  const [colorMode, setColorMode] = useState<OrbColorMode>('brand');
  const [appearance, setAppearance] = useState<'plain' | 'soft'>('plain');
  const [cursorWidth, setCursorWidth] = useState(3);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [scenario, setScenario] = useState<ScenarioId>('knowledge');
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState(-1);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'writing' | 'settled' | 'idle'>('idle');
  const [stopped, setStopped] = useState(false);
  const current = scenarios[scenario];
  const active = run > 0 && stage < 3 && !stopped;
  const tokens: MotionTokens = { ...palette, orbInk: dark ? '#D3DCE7' : '#53627A', ...(dark ? darkTokens : {}), speed, density, dotScale, cursorWidth };
  const code = `import { ThinkingOrb, StreamingText } from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

const tokens = ${JSON.stringify({ ...tokens, orbSize: size }, null, 2)};

<ThinkingOrb variant="${variant}" colorMode="${colorMode}" tokens={tokens} />
<StreamingText text={text} phase="writing" tokens={tokens} />`;

  useEffect(() => {
    if (!run || stopped) return;
    setText(''); setStage(0); setPhase('idle');
    const glyphs = Array.from(current.reply);
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      if (elapsed < 1100) return;
      if (elapsed < 2300) { setStage(1); return; }
      setStage(2);
      const length = Math.min(glyphs.length, Math.floor((elapsed - 2300) / 24) + 1);
      setText(glyphs.slice(0, length).join(''));
      setPhase(length === glyphs.length ? 'settled' : 'writing');
      if (length === glyphs.length) { setStage(3); window.clearInterval(timer); }
    }, 48);
    return () => window.clearInterval(timer);
  }, [run, scenario, stopped, current.reply]);
  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);
  const selectScenario = (id: ScenarioId) => {
    setScenario(id); setRun(0); setStage(-1); setText(''); setPhase('idle'); setStopped(false);
  };
  const startDemo = () => { setStopped(false); setStage(0); setRun(value => value + 1); };
  const stopDemo = () => { setStopped(true); setPhase('idle'); };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  };

  return <MotionTheme className={`showcase ${dark ? 'is-dark' : ''}`} tokens={tokens}>
    <a className="skip-link" href="#main">跳到主要内容</a>
    <aside className="sidebar">
      <a className="wordmark" href="#overview"><span className="brand-symbol"><i/><i/><i/></span><span>chat motion<span className="wordmark-sub">THE COMPONENT COLLECTION</span></span></a>
      <p className="sidebar-label">EXPLORE</p>
      <nav aria-label="展厅导航">
        <a href="#overview"><span>01</span> 组件总览 <Arrow/></a>
        <a href="#playground"><span>02</span> 动效实验室 <Arrow/></a>
        <a href="#scenarios"><span>03</span> 业务场景 <Arrow/></a>
        <a href="#integration"><span>04</span> 接入与保障 <Arrow/></a>
      </nav>
      <div className="sidebar-note"><span className="live-dot"/> LOCAL PLAYGROUND<p>从一个微小的等待，<br/>到一段清晰的对话。</p><small>不连接模型，不发送业务数据。</small></div>
      <div className="sidebar-bottom"><a href={repository} target="_blank" rel="noreferrer">Source on GitHub <Arrow diagonal/></a><span>MIT LICENSE · v0.2.1</span></div>
    </aside>
    <div className="page">
      <header className="topbar"><span>COMPONENTS / CHAT EXPERIENCE</span><div><button aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '继续动效' : '暂停动效'}</button><button aria-pressed={dark} data-action="theme" onClick={() => setDark(!dark)}>{dark ? '浅色模式' : '深色模式'}</button><a href={repository + '#readme'}>文档 <Arrow diagonal/></a></div></header>
      <main id="main">
        <section id="overview" className="overview">
          <div className="hero">
            <div className="hero-copy"><p className="eyebrow"><span/> A LITTLE MOTION. A CLEARER CONVERSATION.</p><h1>让每一步等待，<br/><em>都有清晰的回应。</em></h1><p className="hero-description">为 AI 产品构建有温度的进展反馈。<br/>从理解、检索到输出，用轻量动效让用户知道正在发生什么。</p><div className="hero-actions"><a className="primary-link" href="#playground">探索组件 <Arrow/></a><a href="#scenarios">看看业务中的样子 <Arrow diagonal/></a></div><div className="hero-tags"><span>React + TypeScript</span><span>Canvas + CSS</span><span>MIT 开源</span></div></div>
            <div className="hero-preview"><div className="preview-caption"><span className="live-dot"/> PRESENTATION, NOT YOUR BACKEND<span>LIVE</span></div><div className="hero-orb"><ThinkingOrb variant="composing" size={156} paused={paused} colorMode={colorMode}/></div><p className="hero-state">把等待，变成看得见的进展。</p><div className="hero-stream"><StreamingText text="正在把零散信息，整理成清晰的回答" phase="writing" paused={paused}/></div><div className="preview-bottom"><span>真实组件 · 示例文案</span><span>01 / ORBS & STREAMING</span></div></div>
          </div>
          <div className="section-heading"><div><p className="eyebrow">THE FULL COLLECTION</p><h2>五种动作，各有所长。</h2></div><p>同一套 API，不同的反馈节奏。<br/>点击选择，在下方自由调整。</p></div>
          <div className="orb-gallery">{variants.map((item, index) => <button className="orb-card" data-variant={item.id} key={item.id} aria-pressed={variant === item.id} onClick={() => setVariant(item.id)}><div className="orb-card-top"><span>0{index + 1}</span><span className="card-selected">{variant === item.id ? '已选择' : '选择'} <Arrow/></span></div><div className="orb-card-stage"><ThinkingOrb variant={item.id} size={96} paused={paused} colorMode={colorMode}/></div><strong>{item.name}</strong><p>{item.description}</p><small>{item.use}</small></button>)}</div>
          <div className="collection-footnote"><span>无外框是默认选项。需要时，也可以加一层轻胶囊。</span><span>5 variants · 2 primitives · your brand</span></div>
        </section>

        <section id="playground" className="section playground-section">
          <div className="section-heading"><div><p className="eyebrow">MAKE IT YOURS</p><h2>你的品牌，你的节奏。</h2></div><p>颜色、尺寸、粒子与光标，一处调整。<br/>复制可用代码，带回你的产品。</p></div>
          <div className="playground">
            <div className="playground-display">
              <div className="panel-heading"><span>LIVE PREVIEW</span><code>{variant}</code></div>
              <div className="large-orb"><ThinkingOrb variant={variant} size={size} paused={paused} colorMode={colorMode}/><span>{variants.find(item => item.id === variant)?.name}</span></div>
              <div className="status-preview"><StatusPill variant={variant} label="正在整理关键信息" colorMode={colorMode} size="lg" appearance={appearance} paused={paused}/></div>
              <div className="cursor-preview"><span className="mini-label">STREAMING TEXT</span><p><StreamingText text="让内容自然出现，让品牌色光标轻轻跟随。" phase="writing" paused={paused}/></p></div>
              <div className="status-scale"><span className="mini-label">状态语义</span><StatusPill label="已完成" status="success" size="sm"/><StatusPill label="暂时中断" status="error" size="sm"/><StatusPill label="等待开始" status="idle" size="sm" variant={variant} paused/></div>
            </div>
            <div className="controls">
              <div className="panel-heading"><span>DESIGN TOKENS</span><button onClick={() => { setPreset('spectrum'); setPalette(presets.spectrum); setSize(96); setSpeed(1); setDensity(1); setDotScale(1); setColorMode('brand'); setAppearance('plain'); setCursorWidth(3); }}>重置</button></div>
              <div className="control-grid"><label>色彩预设<select aria-label="色彩预设" value={preset} onChange={event => { setPreset(event.target.value); setPalette(presets[event.target.value]); }}><option value="spectrum">Spectrum · 多彩</option><option value="ocean">Ocean · 海洋</option><option value="iris">Iris · 鸢尾</option>{preset === 'custom' && <option value="custom">Custom · 自定义</option>}</select></label><label>粒子用色<select aria-label="粒子用色" value={colorMode} onChange={event => setColorMode(event.target.value as OrbColorMode)}><option value="brand">底色 + 品牌高光</option><option value="mono">纯单色</option></select></label></div>
              <div className="palette">{(['cyan', 'blue', 'violet', 'red', 'orange'] as const).map(key => <label key={key}><input aria-label={key + ' 色标'} type="color" value={palette[key]} onChange={event => { setPreset('custom'); setPalette(previous => ({ ...previous, [key]: event.target.value })); }}/><span>{palette[key]}</span></label>)}</div>
              <div className="control-grid sliders"><label>球体尺寸 <output>{size}px</output><input aria-label="球体尺寸" type="range" min="20" max="160" value={size} onChange={event => setSize(Number(event.target.value))}/></label><label>动画速度 <output>{speed}×</output><input aria-label="动画速度" type="range" min="0" max="3" step=".25" value={speed} onChange={event => setSpeed(Number(event.target.value))}/></label><label>粒子密度 <output>{density}×</output><input aria-label="粒子密度" type="range" min=".5" max="1.5" step=".25" value={density} onChange={event => setDensity(Number(event.target.value))}/></label><label>粒子大小 <output>{dotScale}×</output><input aria-label="粒子大小" type="range" min=".5" max="2" step=".1" value={dotScale} onChange={event => setDotScale(Number(event.target.value))}/></label></div>
              <div className="control-grid"><label>状态外观<select aria-label="状态外观" value={appearance} onChange={event => setAppearance(event.target.value as 'plain' | 'soft')}><option value="plain">Plain · 无外框</option><option value="soft">Soft · 轻胶囊</option></select></label><label>光标宽度 <output>{cursorWidth}px</output><input aria-label="光标宽度" type="range" min="1" max="8" value={cursorWidth} onChange={event => setCursorWidth(Number(event.target.value))}/></label></div>
              <p className="control-note">颜色属于设计 token，不是 API 密钥。文字样式继承你的应用。</p>
            </div>
          </div>
          <details className="code-panel"><summary>把这个效果带回项目 <span>React / TSX <Arrow/></span></summary><div className="code-toolbar"><span>自动跟随上方参数更新</span><button onClick={copyCode}>{copied ? '已复制 ✓' : '复制代码'}</button></div><p className="sr-only" role="status">{copied ? '代码已复制' : copyError ? '复制失败，请手动选择下方代码。' : ''}</p>{copyError && <p>当前环境无法复制，请手动选择下方代码。</p>}<pre><code>{code}</code></pre></details>
        </section>

        <section id="scenarios" className="section scenarios-section">
          <div className="section-heading"><div><p className="eyebrow">FROM COMPONENTS TO CONTEXT</p><h2>放进业务，才看得出意义。</h2></div><p>不仅是一颗“正在转”的球。<br/>让用户理解每个阶段，以及接下来会发生什么。</p></div>
          <div className="scenario-switch" role="group" aria-label="选择演示场景">{(Object.keys(scenarios) as ScenarioId[]).map(id => <button key={id} aria-pressed={scenario === id} onClick={() => selectScenario(id)}>{scenarios[id].name}</button>)}<span><i/> 前端模拟 · 未接业务系统</span></div>
          <div className="scenario-workspace">
            <div className="conversation"><div className="panel-heading"><span>{current.role}</span><span>DEMO SESSION</span></div><div className="user-message">{current.request}</div><div className="assistant-reply"><span className="assistant-mark">cm</span><div><span className="assistant-name">{current.role}</span><StatusPill label={stopped ? '演示已停止' : stage < 0 ? '准备好了，开始演示看看' : stage === 3 ? '整理完成' : current.stages[stage]} status={stopped || stage < 0 ? 'idle' : stage === 3 ? 'success' : 'running'} variant={stageVariants[Math.max(0, Math.min(stage, 2))]} size="lg" colorMode={colorMode} paused={paused} announce/><p className={text ? 'response-text' : 'response-placeholder'}><StreamingText key={scenario + run} text={text || '点击下方按钮，观察阶段变化与文字逐步呈现。'} phase={phase} paused={paused}/></p></div></div><div className="conversation-actions"><button className="primary-button" onClick={startDemo} disabled={active}>{stage >= 0 && !active ? '重新演示' : '开始演示'} <Arrow/></button>{active && <button onClick={stopDemo}>停止</button>}<span>暂停动效不会阻止文本到达。</span></div></div>
            <aside className="stage-panel" aria-label="示例流程"><p className="eyebrow">VISIBLE PROGRESS</p><h3>从输入，到有用的结果。</h3><ol>{current.stages.map((label, index) => <li className={stage === index && !stopped ? 'is-current' : stage > index ? 'is-done' : ''} key={label}><span className="stage-number">{stage > index ? '✓' : '0' + (index + 1)}</span><div><strong>{label}</strong><small>{stage > index ? '已完成' : stage === index ? stopped ? '已停止' : '进行中' : '等待处理'}</small></div></li>)}</ol><div className="scenario-boundary"><strong>清楚地表达边界</strong><p>{current.boundary}</p></div></aside>
          </div>
        </section>

        <section id="integration" className="section integration-section">
          <div className="section-heading"><div><p className="eyebrow">SMALL SURFACE. CLEAR BOUNDARIES.</p><h2>融入产品，不接管你的系统。</h2></div><a href={repository + '#在其他-react-项目安装'}>开始接入 <Arrow diagonal/></a></div>
          <div className="integration-grid"><article><span>01 / CONNECT</span><h3>保留已有的数据链路</h3><p>接入你已有的 SSE、fetch 或状态机。把累积文本和公开阶段传进来，渲染由组件完成。</p></article><article><span>02 / CUSTOMIZE</span><h3>遵循你的设计体系</h3><p>不强制 UI 框架，不覆盖全局字体。通过共享 token，与 HeroUI、Fluent UI 或原生页面组合。</p></article><article><span>03 / RESPECT</span><h3>尊重用户与安全边界</h3><p>支持减少动态效果与高对比度。不采集数据、不读取密钥，也不替代后端授权与安全审计。</p></article></div>
          <div className="docs-strip"><div><strong>从视觉反馈，到可维护的组件。</strong><p>MIT 许可、中英文文档、完整来源署名与安全边界，随仓库公开。</p></div><a className="primary-link" href={repository}>查看开源仓库 <Arrow diagonal/></a></div>
          <p className="footnote">业务场景仅作交互示例，不承诺业务结果。此库尚未通过独立安全审计或无障碍认证。v0.2.1 的本地桌面截图与交互检查不代表跨浏览器兼容性认证。</p>
        </section>
      </main>
      <footer><span className="footer-brand">chat motion<span>MAKE WAITING FEEL LIKE PROGRESS.</span></span><div><a href={repository + '/blob/main/LICENSE'}>MIT License</a><a href={repository + '/blob/main/SECURITY.md'}>Security</a><a href={repository + '/blob/main/THIRD_PARTY_NOTICES.md'}>Credits</a></div></footer>
    </div>
  </MotionTheme>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Demo/></StrictMode>);
