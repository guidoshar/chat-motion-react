<div align="center">
  <img src="https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/wordmark.svg" width="340" alt="Chat Motion React" />
  <h1>让每一步等待，都有清晰的回应。</h1>
  <p><strong>Thinking orbs & streaming text, built to fit your brand.</strong></p>
  <p>五种思考动效 · 三套完整响应组合 · 流式文字与品牌色光标</p>
  <p><code>React + TypeScript</code> · <code>Canvas 2D + CSS</code> · <code>MIT</code> · <code>无遥测</code></p>
  <p><a href="#组件展厅">看效果</a> · <a href="#三套响应组合">看新组合</a> · <a href="#业务中的用法">看场景</a> · <a href="#在其他-react-项目安装">开始接入</a> · <a href="README.en.md">English</a></p>
</div>

[![Build and package](https://github.com/guidoshar/chat-motion-react/actions/workflows/build.yml/badge.svg)](https://github.com/guidoshar/chat-motion-react/actions/workflows/build.yml)

![Chat Motion 浅色组件展厅：五种 Orb 与流式光标](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/gallery-light.png)

<sub>文档截图保留 v0.2.1 的实际本地页面；v0.3.0 新增的响应组合请在本地展厅查看，未用旧图冒充新效果。</sub>

**不是再加一个 loading，而是让用户理解当前进展。**
当 AI 产品在理解问题、检索资料或组织回答时，Chat Motion 提供一致、克制、可定制的视觉反馈。你保留已有的模型、SSE 和业务流程；我们提供可以单独使用的思考动画、状态文字和流式光标。

无需 HeroUI、Tailwind、Three.js 或模型 SDK。默认无外框，不强制字体，不接管页面布局。

> 这里的 token 是颜色、尺寸、动效等 **设计 token**，不是 API 密钥。组件不请求模型、不读取凭据，也不生成或伪造后端处理阶段。

## 组件展厅

仓库内置完整的桌面展示页，启动后访问 **http://127.0.0.1:5188**。不是静态效果图：五种 Orb 都在运行，可切换主题、调整参数并体验示例流程。没有公开托管的在线 Demo。

| 展区 | 可以做什么 |
| --- | --- |
| **组件总览** | 同屏比较 Solving / Composing / Ping / Band / Ribbon |
| **响应组合 · NEW** | 同步体验 Clear / Aurora / Glass 的思考、输出、完成与中断；复制接入代码 |
| **动效实验室** | 调整五色色标、单色模式、尺寸、速度、密度与光标；复制当前 React 代码 |
| **业务场景** | 体验知识检索、工业选型、报价协同中的阶段切换与流式输出 |
| **接入与保障** | 了解组件边界、设计体系适配、无障碍行为与安全责任 |

<details>
<summary><strong>查看深色模式</strong></summary>

![Chat Motion 深色展厅](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/gallery-dark.png)

</details>

### Make it yours.

把颜色与节奏交给设计 token，不必复制组件再修改源码。支持默认多彩、Ocean、Iris 和自定义色板；业务中的状态文案仍由你的应用决定。

![实时参数工作台：粒子、状态与流式光标](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/playground.png)

## 三套响应组合

**不止一颗 Orb，而是一整段有节奏的回应。** 新增的 `ResponseExperience` 把思考状态、文字显现、光标和完成收尾组合起来。默认 Clear；原有独立组件保持兼容。启动展厅后打开 [响应组合](http://127.0.0.1:5188/#collections)，点击「同步体验三套」，用同一段文字直接比较。

| 组合 | 思考时 | 输出时 | 完成时 | 适合的界面 |
| --- | --- | --- | --- | --- |
| **Clear · 轻盈** | 单色 Composing + 短状态文字掠光 | 柔和渐显 + 细光束光标 | 轻确认，细线淡出 | 长对话、高频业务工作台；推荐起点 |
| **Aurora · 柔光** | Solving + 局部品牌色柔光 | 微糊到清晰 + 呼吸色点 | 彩色细线收尾 | 品牌助手、创作与探索 |
| **Glass · 磨砂** | Ping + 磨砂状态条 + 掠光 | 字素渐显 + 短线光标 | 状态玻璃淡退 | 工具调用、多助手协同 |

玻璃只出现在短状态区域，正文始终不加大面积玻璃或阴影。参考 Fluent 的动效与材质原则，不是 Microsoft / Copilot 官方组件或逐像素复刻，详见 [来源说明](NOTICE.md)。

### 一次接入整套体验

```tsx
import { ResponseExperience, type ResponsePhase } from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

export function Reply({ text, phase }: { text: string; phase: ResponsePhase }) {
  return (
    <ResponseExperience
      preset="clear" // clear | aurora | glass
      text={text}
      phase={phase}
      tokens={{ glyphFadeMs: 620, glassBlur: 14, sheenDurationMs: 3200 }}
      announce
    />
  );
}
```

你自己的网络层驱动 `thinking → streaming → complete`；异常用 `error`，停止或历史记录用 `idle`。传入累积完整正文，中断时保留 `text` 即可。组件不延迟服务器内容、不创建打字队列，也不自动推进阶段。每条新回复使用独立 `key={messageId}`；多处展示同一阶段时，只开启一次 `announce`。

`label` / `detail` 可传后端允许公开的阶段摘要；省略 `label` 时显示中文阶段默认文案。国际化由宿主传入本地化文案。默认是 `phase="thinking"`、`preset="clear"`、`announce={false}`。

也可以只取其中一种文字或光标效果，与现有状态组件自由组合：

```tsx
<StreamingText text={text} phase="writing" reveal="soft" cursor="beam" />
// reveal: fade | soft | blur | none
// cursor: spectrum | beam | dot | line | none
```

Clear 默认渐显 620ms，Aurora 540ms，Glass 320ms；`glyphFadeMs` 可覆盖。减少动态效果时取消渐显、模糊与高光动画；不支持背景模糊或开启减少透明效果时，Glass 使用实色回退。深色界面请使用 `darkTokens` 或设置自己的深色表面 token。

## 业务中的用法

组件关注的是**人与系统之间的反馈**，不是替你决定业务流程。下面这些场景展示接入方式，并不宣称此仓库具备对应的后端能力。

| 场景 | 展示给用户的进展 | 适合采用的组件 | 你的系统负责 |
| --- | --- | --- | --- |
| 企业知识检索 | 理解问题 → 检索资料 → 整理回答 | Solving → Ping → Composing + StreamingText | 检索、来源引用、访问权限 |
| 工业选型 | 识别工况 → 核对参数 → 返回建议 | StatusPill + Orb + 流式确认清单 | 产品数据、规则引擎、兼容性校核 |
| 报价协同 | 整理规格 → 交接报价 → 输出摘要 | 分阶段状态 + 品牌色光标 | 正式价格、税费、审批与商业承诺 |

![工业选型示例：对话、阶段与完成结果](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/business-flow.png)

> 上图是实际运行的本地页面截图，内容是**明确标注的前端模拟**。报价演示中的 ¥100.00 不是正式报价；组件没有连接企业知识库、产品或价格系统。公开的处理阶段不等于模型内部推理。

## 为什么选择它

- **给产品团队：** 用统一的视觉语言表达“正在处理、已完成、暂时中断、等待开始”，而不是在每个页面重新设计状态。
- **给设计团队：** 无外框优先、品牌高光克制，五种动作有不同节奏。
- **给工程团队：** 两个核心呈现组件、类型化 token、ESM 与 CSS 独立入口。复用已有 SSE、状态机和 UI 框架。
- **给安全与维护团队：** 无遥测、无凭据读取、无远程运行时素材；许可来源、发布包范围和宿主责任明确公开。

这是面向产品集成的设计取向，**不代表已经取得企业安全、无障碍或性能认证**。

## 包含什么

- `ThinkingOrb`：`solving`、`composing`、`ping`、`band`、`ribbon` 五种粒子动画。
- `StreamingText`：随已收到的文本更新，末尾渐显、彩色流动光标、完成淡出。
- `StatusPill`：`ThinkingOrb` 的可选文字状态组合，默认无边框；不是额外聊天业务模块。
- `ResponseExperience`：Clear / Aurora / Glass 三套配套响应；`responsePresets` 导出各组的 Orb、文字与光标映射。
- `MotionTheme` / `motionTokens`：共享设计 token，可局部覆盖，不强制使用 Provider。
- 本地组件展厅：五种动效、品牌参数工作台、可复制代码、三种业务模拟与完成／中断／空闲状态。
- 可接真实服务的 [SSE 示例](examples/SseReply.tsx)。

这是从应用内 UI 模块独立整理出的新包，不包含原应用后端、业务规则、登录代码、数据、logo 或人物头像。原应用没有被自动切换为依赖此包。

### 五种动作

| variant | 视觉行为 | 用途示例，不绑定业务含义 |
| --- | --- | --- |
| `solving` | 球面点阵分层四分之一转，打乱、逆序复位，再短暂停顿 | 理解需求、求解 |
| `composing` | 保持球体朝向，宽点阵带起伏流动，带淡淡的球壳 | 整理思路、组织回答 |
| `ping` | 光环沿球面去往对侧，再原路返回；1× 时 4.2 秒一轮 | 扫描、检索 |
| `band` | 球面旋转光带；保留原 API | 通用处理 |
| `ribbon` | 旋转的螺旋粒子带；保留原 API | 持续生成 |

前两种参考 Libraries.dev 的前两个展示并改编其 MIT 几何实现；`ping` 根据 MetalForge 公开视觉说明独立实现。并非官方组件或逐像素复刻。新三种默认用克制底色加品牌高光；`colorMode="mono"` 可切换纯单色。

## 本地启动

需要 Node.js 20.19+、npm；依赖只安装在项目内。使用本地 Vite，不使用 Docker、Cloudflare 或 GitHub Pages。

```powershell
git clone git@github.com:guidoshar/chat-motion-react.git
cd chat-motion-react
npm ci
npm run dev
```

演示地址：`http://127.0.0.1:5188`。端口占用时会明确报错，不会自动跳到别的端口。演示使用模拟文本，不会访问任何模型或业务接口。

```powershell
npm run build        # ESM、TypeScript 声明、CSS → dist/
npm run build:demo   # 类型检查并构建本地演示 → demo-dist/
npm pack            # 生成可安装的 .tgz
```

需要重新生成文档截图时，在已运行预览的另一终端执行 `npm run capture:docs`。这是**主动执行**的本地桌面截图流程，使用项目内 Playwright 与已安装的 Chrome 独立无头进程，不读取用户浏览器资料，不在 CI 自动执行。截图资源仅保存在仓库，不增加运行时包体积。

## 在其他 React 项目安装

这是 GitHub 源码发布，**不表示已发布到 npm registry**。React 18.2 / 19 为 peer dependency，ESM 格式；不提供 CommonJS 构建。

### 从 GitHub 安装

推荐下载 [v0.3.0 Release](https://github.com/guidoshar/chat-motion-react/releases/tag/v0.3.0) 中预构建的 `.tgz`，核对 release 的 SHA-256 后安装。此路径不需要在消费端运行构建脚本：

```powershell
Get-FileHash ./guidoshar-chat-motion-react-0.3.0.tgz -Algorithm SHA256
npm install ./guidoshar-chat-motion-react-0.3.0.tgz --ignore-scripts
```

需要直接从源码安装时：

```powershell
npm install "git+ssh://git@github.com/guidoshar/chat-motion-react.git#v0.3.0"
```

也可用 HTTPS（不要求配置 SSH key）：

```powershell
npm install "git+https://github.com/guidoshar/chat-motion-react.git#v0.3.0"
```

Git 安装时 `prepare` 会构建 `dist`，需要允许 npm lifecycle scripts。生产项目请固定 tag 或 commit，不跟随浮动分支。如果组织禁用安装脚本，先在源码目录 `npm ci` / `npm pack`，再安装生成的文件：

```powershell
npm install ./guidoshar-chat-motion-react-0.3.0.tgz --ignore-scripts
```

### 最小用法

样式必须在应用入口导入一次；包不会全局重置字体或页面样式。

```tsx
import { ThinkingOrb, StatusPill, StreamingText } from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

export function Reply({ text, done }: { text: string; done: boolean }) {
  return (
    <div>
      <ThinkingOrb variant="composing" size={64} label="正在思考" />
      <StatusPill label={done ? '已完成' : '正在整理回答'}
        status={done ? 'success' : 'running'} size="lg" announce />
      <p><StreamingText text={text} phase={done ? 'settled' : 'writing'} /></p>
    </div>
  );
}
```

`text` 传**截至当前已累积的完整文本**，不是单个 delta。组件不延迟服务器内容，也不自带打字计时器。恢复历史消息请传 `phase="idle"`，不会重复显示完成光标。新回复使用独立的 `key={messageId}`。

## 更换设计 token

### 1. 一次修改两个组件：推荐

```tsx
import { MotionTheme, ThinkingOrb, StreamingText, type MotionTokens } from '@guidoshar/chat-motion-react';

const ocean = {
  cyan: '#36B8BE',
  blue: '#176BA0',
  violet: '#338BBA',
  red: '#247F98',
  orange: '#71D1D1',
  orbSize: 64,
  orbInk: '#53627A',
  density: 1,
  dotScale: 1,
  speed: 1.25,
  labelSize: 14,
  cursorWidth: 3,
  cursorHeight: '1.15em',
  glyphFadeMs: 260,
  cursorCycleMs: 2200,
} satisfies MotionTokens;

<MotionTheme tokens={ocean}>
  <ThinkingOrb variant="band" />
  <StreamingText text={text} phase="writing" />
</MotionTheme>
```

`MotionTheme` 只渲染一个带 CSS 变量的 `div`，可嵌套。没有运行时上下文要求。如果不想增加 DOM 层级，把 token 放在自己的容器上：

```tsx
import { motionTokens } from '@guidoshar/chat-motion-react';

<section style={motionTokens(ocean)}>
  <ThinkingOrb />
  <StreamingText text={text} />
</section>
```

### 2. 只改一个实例

```tsx
<ThinkingOrb variant="ping" tokens={{ orbSize: 72, speed: 0.75 }} />
<StreamingText text={text} tokens={{ cursorWidth: 4, glyphFadeMs: 200 }} />

// 最多取前 16 个六位 HEX 色标，只影响这个 orb，不影响文字光标。
<ThinkingOrb palette={['#14B8A6', '#2563EB', '#8B5CF6']} />
<ThinkingOrb variant="solving" colorMode="mono" tokens={{ orbInk: '#53627A' }} />
```

### 3. 直接用 CSS 变量

```css
.my-chat {
  --cm-cyan: #36b8be;
  --cm-blue: #176ba0;
  --cm-violet: #338bba;
  --cm-red: #247f98;
  --cm-orange: #71d1d1;
  --cm-orb-size: 56px;
  --cm-speed: 1.2;
  --cm-cursor-width: 3px;
  --cm-glyph-fade: 260ms;
}

.my-chat[data-theme='dark'] {
  --cm-text: #d3e6f6;
  --cm-muted: #a2b6c8;
  --cm-surface: #182635;
  --cm-border: #2b4055;
}
```

粒子绘制会读取计算后的 CSS token；容器的 `class`、`style`、`data-theme` 变化会刷新 Canvas 色彩。尺寸变化和系统深浅色变化也会刷新。动态修改 CSSOM 或其他自定义属性不会专门触发刷新，请同步修改上述属性之一。不要对 Canvas 本身的 CSS 变量做 CSS 动画。

优先级：**显式 `size` / `speed` / `density` / `dotScale` / `palette` → 组件 `style` → 组件 `tokens` → 最近祖先的 CSS 变量 → 内置默认值**。例如已写 `size={36}` 时，外层 `orbSize: 64` 不会覆盖它；删掉 `size` 即可继承。

### Token 对照

颜色色标 `cyan`…`orange` 和 `orbInk` 请使用 **`#RRGGBB` 六位 HEX**，保证 Canvas 插值与 CSS 光标一致。其余颜色 token 接受普通 CSS 颜色。`palette` 只检查前 16 项，无效色标会被过滤，全部无效时回退默认色板。未指定 `orbInk` 时使用周围文本的计算颜色；Canvas 支持 HEX / 数字 RGB 通道，不支持的宽色域表示回退为中性蓝灰色。

| JS token | CSS variable | 默认 / 含义 |
| --- | --- | --- |
| `cyan` | `--cm-cyan` | `#21A8BD` |
| `blue` | `--cm-blue` | `#1775B9` |
| `violet` | `--cm-violet` | `#76518C` |
| `red` | `--cm-red` | `#DB3B49` |
| `orange` | `--cm-orange` | `#F28B2C` |
| `orbInk` | `--cm-orb-ink` | 周围文本色；中性底色／单色模式 |
| `orbSize` | `--cm-orb-size` | 独立 orb 36px；限制 16–192px |
| `speed` | `--cm-speed` | 1；0 暂停，否则限制 0.25–3 倍 |
| `density` | `--cm-density` | 1；0.5–1.5，按 0.25 档取整 |
| `dotScale` | `--cm-dot-scale` | 1；0.5–2，粒子大小倍率 |
| `labelSize` | `--cm-label-size` | md 12px；sm 11px，lg 14px |
| `gap` | `--cm-gap` | md 5px；sm 3px，lg 8px |
| `pillRadius` | `--cm-pill-radius` | 999px；只影响 soft 外观 |
| `textColor` | `--cm-text` | 状态文字 `#385978`；正文继承 |
| `mutedColor` | `--cm-muted` | `#77899B` |
| `surfaceColor` | `--cm-surface` | `#F3F7FB`；soft 外观 |
| `borderColor` | `--cm-border` | `#E0E9F2`；soft 外观 |
| `successColor` | `--cm-success` | `#287968` |
| `errorColor` | `--cm-error` | `#B4434C` |
| `cursorWidth` | `--cm-cursor-width` | 3px |
| `cursorHeight` | `--cm-cursor-height` | `1.1em`，字符串 |
| `cursorGap` | `--cm-cursor-gap` | 4px |
| `glyphFadeMs` | `--cm-glyph-fade` | 320ms |
| `cursorCycleMs` | `--cm-cursor-cycle` | 2600ms，彩色流动周期 |
| `cursorSettleMs` | `--cm-cursor-settle` | 360ms，完成后的淡出时间 |
| `responseSurface` | `--cm-response-surface` | `rgba(247,250,255,.72)`；Glass 半透明表面 |
| `responseBorder` | `--cm-response-border` | `#DCE6F0`；Glass 边线 |
| `responseRadius` | `--cm-response-radius` | 16px；0–32px |
| `glassBlur` | `--cm-glass-blur` | 14px；0–24px；仅背景模糊 |
| `sheenDurationMs` | `--cm-sheen-duration` | 3200ms；1200–8000ms；状态掠光周期 |

JS 中尺寸数字自动转成 `px`，时长数字自动转成 `ms`；`speed`、`density`、`dotScale` 无单位。直接写 CSS 时自行带单位。`speed` 只控制粒子速度，光标色彩流动速度使用 `cursorCycleMs`（spectrum / dot）。beam / dot / line 的呼吸周期分别为 1700 / 1800 / 2100ms；Clear 细光束默认宽 2px，其余默认 3px。

`motionTokens` 会忽略未知键、错误类型和非有限数字；限制字号 8–48、间距 0–48、圆角 0–999、光标宽度 1–8、光标间距 0–24px，淡入／收尾 0–2000ms、光标循环 500–10000ms。`cursorHeight` 只接受非负数字加 px/em/rem/%。颜色字符串最长 128 字符，过滤 URL、expression、声明分隔符等常见不适用输入。这是配置防误用保护，**不是不可信 CSS 的安全沙箱**；`style` / CSS 变量仍属于宿主可信配置。不要直接传入任意远程主题 JSON。

深色预设可用 `<MotionTheme tokens={darkTokens}>`，只改变语义颜色，保留五色品牌色标。正文的字体、字号、行高由父容器正常 CSS 控制。

## SSE 接入

已经有 SSE reader：直接把收到的 delta 追加到状态，不需要换网络层。

```tsx
// 在现有的 SSE 回调中：
onDelta(delta => setText(previous => previous + delta));
onDone(() => setPhase('settled'));
onError(() => setPhase('idle')); // 停止光标，保留已收到的文字
```

这些是接入点示意，不是此包导出的函数。完整的原生 `EventSource` 示例在 [examples/SseReply.tsx](examples/SseReply.tsx)，包含取消、卸载清理、失败提示和主动关闭连接。仅接受同源 HTTP(S) 地址，不允许 URL 内嵌用户名密码。它只支持 GET；需要 POST 或自定义 Authorization header 时，继续使用你的 `fetch` + SSE parser，再把解析结果传给组件。不要把生产模型密钥或访问 token 放在前端代码、URL 或日志中。

示例限制单个 JSON 事件 65,536、阶段文案 160、累积正文 200,000 个 **UTF-16 码元**；45 秒无有效 stage/delta 或总时长 5 分钟会断开。SSE 注释心跳不会延长示例的空闲期限。这些只是客户端示例限制：浏览器可能在回调前缓冲数据，服务端／代理仍需限制消息大小、速率、并发、授权与超时。

示例要求服务端返回 `Content-Type: text/event-stream`，每个事件以空行结束：

```text
event: stage
data: {"label":"正在整理资料"}

event: delta
data: {"text":"你好，"}

event: delta
data: {"text":"回答正在生成。"}

event: done
data: {}

```

服务失败可发送 `event: failed`。若已有后端事件名或 JSON 字段不同，只需改示例的映射。示例在网络中断时关闭连接，不自动续传，避免重复追加；生产应用的恢复策略由自己的后端协议决定。示例不会自建后端。

阶段文字应来自**允许展示给用户的简短后端状态**，例如“检索资料”“生成回答”，而非模型内部推理。组件只渲染你传入的文案。

## Props 简表

| 组件 | 主要 props |
| --- | --- |
| `ThinkingOrb` | `variant='band'`、`size`、`speed`、`paused=false`、`colorMode='brand'`、`density`、`dotScale`、`palette`、`label` |
| `StatusPill` | `label` 必填、`status='running'`、`variant='band'`、`size='md'`、`appearance='plain'`、`announce=false`、`paused`、`speed`、`colorMode`、`density`、`dotScale`、`palette` |
| `StreamingText` | `text` 必填、`phase='writing'`（writing / settled / idle）、`paused=false`、`reveal='fade'`、`cursor='spectrum'` |
| `ResponseExperience` | `text` 必填、`preset='clear'`、`phase='thinking'`、`label`、`detail`、`paused=false`、`announce=false` |

以上组件都支持 `tokens`、`style`、`className`。`StatusPill.status` 可选 running / success / error / idle；sm / md / lg 的默认图标尺寸是 28 / 36 / 56px。组合组件默认使用 32px 图标、13px 状态文字，可用 `orbSize` / `labelSize` 覆盖。

## 行为与边界

- Canvas 使用 `requestAnimationFrame`，跟随屏幕刷新回调，按时间增量更新；不承诺固定帧率。DPR 上限 2，减少高分屏开销。
- 根据尺寸选择三档几何细节，密度使用五档缓存，最多 15 份网格。小尺寸自动减少粒子；最高配置低于 1,000 点／实例，但不是大量实例同时运行的性能承诺。
- 粒子在页面隐藏、离开视口、`paused`、`speed=0` 或系统“减少动态效果”时暂停。无 React 每帧 setState。
- 文字只为最新 24 个字素创建渐显节点，完成后恢复纯文本。优先分段末尾 2,048 码元窗口，边界按完整字素对齐，正文不截断；极长组合字素可能扩大窗口。使用 `Intl.Segmenter` 处理组合字符；不支持该 API 时降级为 Unicode 码点，复杂 emoji 的分段可能不完整。
- 高对比度模式使用系统色静态圆环与光标；光标位置使用逻辑方向属性。支持减少动态效果。仍需在宿主产品中检查对比度、键盘、读屏与 RTL 布局。
- `paused` 只暂停动效，不停止 SSE 或阻止文字更新。独立组件的退出视口暂停适用于粒子，独立光标支持页面隐藏和减少动态效果。`ResponseExperience` 额外协调视口外／后台的粒子、光标、文字与状态动画。
- 支持服务端渲染：render 阶段不读取 `window` / `document`。导出保留 `use client`；Next.js App Router 中从客户端组件使用，在根 layout 导入 CSS。此仓库不包含 Next.js 集成验证。
- 粒子默认装饰性隐藏。独立使用时给 `label`；状态提示可用 `announce`。流式正文不设逐字 `aria-live`，避免读屏反复朗读；在宿主界面用一个独立 live region 宣布完成。
- 文本按纯文本安全渲染，不支持 Markdown/HTML；富文本排版请由宿主渲染器负责，不要把未清洗的服务端内容插入 HTML。
- 无状态机、模型调用、用户系统、业务逻辑或第三方品牌人物资产。可与 HeroUI、Fluent UI 或原生 React 页面组合。

## 来源与许可

MIT，见 [LICENSE](LICENSE)；Libraries.dev 改编部分的原作者完整 MIT 许可随源码和安装包保留在 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。视觉灵感、品牌色说明和商标边界见 [NOTICE.md](NOTICE.md)。默认颜色参考所提供品牌标志的屏幕观感，不是官方品牌规范，也不表示品牌方认可。

## 发布质量边界

v0.3.0 完成 TypeScript／组件包／演示构建与静态发布内容检查；本轮未运行测试或浏览器检查，新增三套响应组合仍需在宿主页面中做视觉与交互验收。

文档图片保留 v0.2.1 的本地桌面 Chrome 截图；该版本曾修复 JSX runtime 导致的 `React is not defined` 白屏并完成针对性演示交互检查。旧截图不是新组合的验证证据。

没有运行完整自动化回归或跨浏览器测试矩阵。React 18/19 是声明的 peer 范围，不代表已完成全版本兼容性验证。未经过独立安全审计、WCAG 认证或企业合规认证；生产接入前请执行 [CONTRIBUTING.md](CONTRIBUTING.md) 的验收清单。

---

[English guide](README.en.md) · [Changelog](CHANGELOG.md) · [Security policy](SECURITY.md) · [Contributing](CONTRIBUTING.md) · [MIT License](LICENSE)
