import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionTheme, ThinkingOrb, StatusPill, StreamingText, darkTokens, type MotionTokens, type OrbVariant, type OrbColorMode } from '../src/index.js';
import '../src/styles.css';
import './styles.css';

const sample = '你好，我是诺小顿。\n我会用不同的动作表达进展：分层求解、整理思路、扫描信息。\n回答随数据自然呈现，品牌色光标轻轻跟随。所有视觉都能通过 design tokens 调整。';
const featured: { variant: OrbVariant; name: string; detail: string; label: string; status: string }[] = [
  { variant: 'solving', name: 'Solving', detail: '分层扭转 · 打乱与复位', label: '正在理解需求', status: 'NEW' },
  { variant: 'composing', name: 'Thinking', detail: '固定朝向 · 点阵带起伏', label: '正在整理思路', status: 'NEW' },
  { variant: 'ping', name: 'Ping', detail: '球面光环 · 扩散与回波', label: '正在扫描信息', status: 'REFINED' },
];
const presets: Record<string, MotionTokens> = {
  spectrum: {},
  ocean: { cyan: '#36B8BE', blue: '#176BA0', violet: '#338BBA', red: '#247F98', orange: '#71D1D1' },
  iris: { cyan: '#9087ED', blue: '#6657C4', violet: '#A36CBC', red: '#BB71A0', orange: '#DA9BBD' },
};

function Demo() {
  const [theme, setTheme] = useState('spectrum');
  const [dark, setDark] = useState(false);
  const [paused, setPaused] = useState(false);
  const [size, setSize] = useState(80);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(1);
  const [dotScale, setDotScale] = useState(1);
  const [colorMode, setColorMode] = useState<OrbColorMode>('brand');
  const [appearance, setAppearance] = useState<'plain' | 'soft'>('plain');
  const [variant, setVariant] = useState<OrbVariant>('composing');
  const [cursorWidth, setCursorWidth] = useState(3);
  const [run, setRun] = useState(0);
  const [text, setText] = useState('点击“演示一次”，查看阶段切换与流式文字。');
  const [stage, setStage] = useState(3);
  const [phase, setPhase] = useState<'writing' | 'settled' | 'idle'>('idle');
  useEffect(() => {
    if (!run) return;
    setText(''); setStage(0); setPhase('idle');
    const glyphs = Array.from(sample);
    let index = 0;
    let ticks = 0;
    const timer = window.setInterval(() => {
      ticks++;
      if (ticks < 20) return;
      setStage(ticks < 40 ? 1 : 2);
      if (ticks < 40) return;
      index = Math.min(glyphs.length, index + 2);
      setText(glyphs.slice(0, index).join(''));
      setPhase(index === glyphs.length ? 'settled' : 'writing');
      if (index === glyphs.length) { setStage(3); window.clearInterval(timer); }
    }, 60);
    return () => window.clearInterval(timer);
  }, [run]);
  const tokens: MotionTokens = { ...presets[theme], orbInk: '#53627A', ...(dark ? darkTokens : {}), speed, density, dotScale, cursorWidth };
  const stages = ['理解你的需求', '扫描相关信息', '正在组织回答', '已完成'];
  const stageVariants: OrbVariant[] = ['solving', 'ping', 'composing', 'composing'];

  return <MotionTheme className={`demo ${dark ? 'is-dark' : ''}`} tokens={tokens}>
    <div className="demo-shell">
      <header>
        <a className="wordmark" href="#top"><span/> CHAT MOTION <small>REACT / 0.2</small></a>
        <nav aria-label="组件文档"><a href="https://github.com/guidoshar/chat-motion-react#readme">使用文档 ↗</a><button onClick={() => setDark(!dark)} aria-pressed={dark}>{dark ? '切换浅色' : '切换深色'}</button></nav>
      </header>
      <section className="intro" id="top"><p className="eyebrow">THOUGHTFUL MOTION, WITHOUT THE NOISE.</p><h1>让等待有进展。<br/><span>让对话有温度。</span></h1><p>三种新的思考节奏，一支轻盈的流式光标。<br/>为你的品牌而变，不为你的应用增加负担。</p><div className="traits"><span>React + TypeScript</span><span>Canvas + CSS</span><span>MIT 开源</span><span>无遥测</span></div></section>
      <div className="layout">
        <main>
          <section className="section" aria-labelledby="motion-heading">
            <div className="section-heading"><h2 id="motion-heading"><span>01</span> 思考，不止一种节奏</h2><span>点击选择一个动效</span></div>
            <div className="specimens">{featured.map(item => <button className="specimen" key={item.variant} aria-pressed={variant === item.variant} onClick={() => setVariant(item.variant)}>
              <div className="specimen-top"><code>{item.variant}</code><span>{item.status}</span></div>
              <div className="specimen-art"><ThinkingOrb variant={item.variant} size={size} paused={paused} colorMode={colorMode}/></div>
              <strong>{item.name}</strong><p>{item.detail}</p><span className="selection-mark" aria-hidden="true">{variant === item.variant ? '已选择 ·' : '选择 ↗'}</span>
            </button>)}</div>
            <div className="legacy"><span>经典动效仍然保留</span>{(['band', 'ribbon'] as const).map(item => <button key={item} aria-pressed={variant === item} onClick={() => setVariant(item)}><ThinkingOrb variant={item} size={28} paused={paused} colorMode={colorMode}/><code>{item}</code></button>)}</div>
            <div className="inline-preview"><span className="mini-label">放进你的界面</span><StatusPill variant={variant} colorMode={colorMode} label={featured.find(item => item.variant === variant)?.label ?? '正在处理'} size="lg" appearance={appearance} paused={paused}/><div className="size-samples" aria-label="行内尺寸示例"><ThinkingOrb variant={variant} size={20} paused={paused} colorMode={colorMode}/><ThinkingOrb variant={variant} size={28} paused={paused} colorMode={colorMode}/><small>20 / 28px</small></div></div>
          </section>
          <section className="section" aria-labelledby="stream-heading">
            <div className="section-heading"><h2 id="stream-heading"><span>02</span> 从思考，到回答</h2><button onClick={() => setRun(value => value + 1)}>{run ? '重新演示' : '演示一次'} ↗</button></div>
            <div className="reply" key={run}>
              <StatusPill label={run ? stages[stage] : '准备好了'} variant={stageVariants[stage]} colorMode={colorMode} size="lg" status={!run ? 'idle' : stage === 3 ? 'success' : 'running'} paused={paused} announce/>
              <p className="reply-text"><StreamingText text={text} phase={phase} paused={paused}/></p>
            </div>
            <p className="note">本地模拟数据，不连接模型服务。暂停只影响动效，文本仍会继续到达。</p>
          </section>
          <section className="assurance"><h2>为真实应用保留边界</h2><div><p><strong>呈现，不接管数据</strong><span>不发请求，不读凭据，不写存储。</span></p><p><strong>可访问的动态体验</strong><span>支持减少动态效果和高对比度。</span></p><p><strong>清楚的开源来源</strong><span>许可、版本与安全说明随包提供。</span></p></div><p className="note">这些是实现与设计约束，不代表已经通过安全审计或兼容性认证。</p></section>
        </main>
        <aside aria-label="设计参数">
          <div className="section-heading"><h2>Make it yours.</h2><span>DESIGN TOKENS</span></div>
          <label>色彩方案<select value={theme} onChange={event => setTheme(event.target.value)}><option value="spectrum">Spectrum · 品牌多彩</option><option value="ocean">Ocean · 海洋</option><option value="iris">Iris · 鸢尾</option></select></label>
          <label>粒子用色<select value={colorMode} onChange={event => setColorMode(event.target.value as OrbColorMode)}><option value="brand">克制底色 + 品牌高光</option><option value="mono">纯单色 · 接近参考图</option></select></label>
          <label>状态容器<select value={appearance} onChange={event => setAppearance(event.target.value as 'plain' | 'soft')}><option value="plain">无外框 Plain</option><option value="soft">轻胶囊 Soft</option></select></label>
          <label>粒子球尺寸 <output>{size}px</output><input type="range" min="20" max="128" value={size} onChange={event => setSize(Number(event.target.value))}/></label>
          <label>运行速度 <output>{speed}×</output><input type="range" min="0" max="3" step=".25" value={speed} onChange={event => setSpeed(Number(event.target.value))}/></label>
          <label>粒子密度 <output>{density}×</output><input type="range" min=".5" max="1.5" step=".25" value={density} onChange={event => setDensity(Number(event.target.value))}/></label>
          <label>粒子大小 <output>{dotScale}×</output><input type="range" min=".5" max="2" step=".1" value={dotScale} onChange={event => setDotScale(Number(event.target.value))}/></label>
          <label>光标宽度 <output>{cursorWidth}px</output><input type="range" min="1" max="6" value={cursorWidth} onChange={event => setCursorWidth(Number(event.target.value))}/></label>
          <button className="toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '继续动效' : '暂停全部动效'}</button>
          <pre><code>{`<MotionTheme tokens={${JSON.stringify({ ...tokens, orbSize: size }, null, 2)}}>\n  <ThinkingOrb\n    variant="${variant}"\n    colorMode="${colorMode}"\n  />\n  <StreamingText text={text} />\n</MotionTheme>`}</code></pre>
        </aside>
      </div>
      <footer><span>CHAT MOTION / DESIGNED TO FIT YOUR CONVERSATION.</span><a href="https://github.com/guidoshar/chat-motion-react">Source on GitHub ↗</a></footer>
    </div>
  </MotionTheme>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Demo/></StrictMode>);
