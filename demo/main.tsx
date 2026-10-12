import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionTheme, ThinkingOrb, StatusPill, StreamingText, darkTokens, type MotionTokens, type OrbVariant } from '../src/index.js';
import '../src/styles.css';
import './styles.css';

const sample = '你好，我是诺小顿。\n两个组件已准备好：思考动画展示当前阶段，流式文字随数据到达逐段呈现。\n颜色、尺寸、速度与光标都可以使用同一组 design token 调整。✨';
const variants: OrbVariant[] = ['band', 'ping', 'ribbon'];
const presets: Record<string, MotionTokens> = {
  spectrum: {},
  ocean: { cyan: '#36B8BE', blue: '#176BA0', violet: '#338BBA', red: '#247F98', orange: '#71D1D1' },
  iris: { cyan: '#9087ED', blue: '#6657C4', violet: '#A36CBC', red: '#BB71A0', orange: '#DA9BBD' },
};

function Demo() {
  const [theme, setTheme] = useState('spectrum');
  const [dark, setDark] = useState(false);
  const [paused, setPaused] = useState(false);
  const [size, setSize] = useState(64);
  const [speed, setSpeed] = useState(1);
  const [cursorWidth, setCursorWidth] = useState(3);
  const [run, setRun] = useState(1);
  const [text, setText] = useState('');
  const [stage, setStage] = useState(0);
  const [phase, setPhase] = useState<'writing' | 'settled' | 'idle'>('idle');
  useEffect(() => {
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
  const tokens: MotionTokens = { ...presets[theme], ...(dark ? darkTokens : {}), speed, cursorWidth };
  const currentStage = ['理解你的需求', '整理相关信息', '正在生成回答', '已完成'][stage];

  return <MotionTheme className={`demo ${dark ? 'is-dark' : ''}`} tokens={tokens}>
    <div className="demo-shell">
      <header><div className="wordmark"><span/> CHAT MOTION <small>REACT · 0.1</small></div><button onClick={() => setDark(!dark)}>{dark ? '浅色模式' : '深色模式'}</button></header>
      <section className="intro"><p className="eyebrow">TWO COMPONENTS. ONE MOTION LANGUAGE.</p><h1>让等待有进展，<br/>让回答有温度。</h1><p>独立的思考动画与流式文字光标。轻量、无边框，可随你的品牌调整。</p></section>
      <div className="layout">
        <main>
          <section className="section"><div className="section-heading"><h2>01 / 思考状态</h2><span>Canvas 2D · 每帧更新</span></div>
            <div className="orbs">{variants.map(variant => <div key={variant}><ThinkingOrb variant={variant} size={size} paused={paused} label={`${variant} 思考动画`}/><strong>{variant}</strong></div>)}</div>
            <div className="status-row"><StatusPill label="理解需求" size="lg" paused={paused}/><StatusPill label="准备好了" status="success"/><StatusPill label="等待输入" status="idle"/></div>
          </section>
          <section className="section"><div className="section-heading"><h2>02 / 流式回答</h2><button onClick={() => setRun(run + 1)}>重新演示 ↗</button></div>
            <div className="reply" key={run}><StatusPill label={currentStage} variant="ribbon" size="lg" status={stage === 3 ? 'success' : 'running'} paused={paused} announce/>
              <p className="reply-text"><StreamingText text={text} phase={phase} paused={paused}/></p>
              <span className="sr-only" role="status">{stage === 3 ? '回答已完成' : ''}</span>
            </div>
            <p className="note">本页使用本地模拟数据，未连接模型服务。暂停动效不会停止文本数据到达。</p>
          </section>
        </main>
        <aside>
          <div className="section-heading"><h2>Design tokens</h2><span>实时预览</span></div>
          <label>色彩方案<select value={theme} onChange={event => setTheme(event.target.value)}><option value="spectrum">品牌多彩 Spectrum</option><option value="ocean">海洋 Ocean</option><option value="iris">鸢尾 Iris</option></select></label>
          <label>粒子尺寸 <output>{size}px</output><input type="range" min="24" max="128" value={size} onChange={event => setSize(Number(event.target.value))}/></label>
          <label>运行速度 <output>{speed}×</output><input type="range" min="0" max="3" step=".25" value={speed} onChange={event => setSpeed(Number(event.target.value))}/></label>
          <label>光标宽度 <output>{cursorWidth}px</output><input type="range" min="1" max="6" value={cursorWidth} onChange={event => setCursorWidth(Number(event.target.value))}/></label>
          <button className="toggle" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? '继续动效' : '暂停动效'}</button>
          <pre><code>{`<MotionTheme tokens={${JSON.stringify({ ...tokens, orbSize: size }, null, 2)}}>\n  <ThinkingOrb />\n  <StreamingText text={text} />\n</MotionTheme>`}</code></pre>
        </aside>
      </div>
      <footer>React + TypeScript · 无额外运行时依赖 · 尊重系统减少动态效果偏好</footer>
    </div>
  </MotionTheme>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Demo/></StrictMode>);
