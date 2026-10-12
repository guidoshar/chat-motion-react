<div align="center">
  <img src="https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/wordmark.svg" width="340" alt="Chat Motion React" />
  <h1>Make waiting feel like progress.</h1>
  <p><strong>Thinking orbs & streaming text, built to fit your brand.</strong></p>
  <p><code>React + TypeScript</code> · <code>Canvas 2D + CSS</code> · <code>MIT</code> · <code>No telemetry</code></p>
  <p><a href="#component-showroom">Explore</a> · <a href="#business-context">Use cases</a> · <a href="#install">Get started</a> · <a href="README.md">中文文档</a></p>
</div>

[![Build and package](https://github.com/guidoshar/chat-motion-react/actions/workflows/build.yml/badge.svg)](https://github.com/guidoshar/chat-motion-react/actions/workflows/build.yml)

![The live component showroom, in light mode](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/gallery-light.png)

**More than a spinner: a clear signal that work is moving forward.** Give AI
products a consistent visual language for understanding, retrieving, composing
and completion. Keep your existing models, transports and business logic.
Add only the presentation you need.

Small, themeable thinking-state animations and streamed text with a multicolor
cursor. No UI framework, model SDK, remote runtime assets, telemetry or runtime
dependency other than React.

This is a **presentation library**: you own the transport, authentication,
content and public progress stages. Design tokens are colors/sizes, not API keys.

## Component showroom

Run the local desktop showroom at **http://127.0.0.1:5188**. There is no hosted
public demo: the repository includes a live gallery, a token playground with
copyable React code, and three clearly labeled business simulations.

| Explore | What you can do |
| --- | --- |
| All five orbs | Compare solving, composing, ping, band and ribbon side by side |
| Response collections · NEW | Compare Clear, Aurora and Glass using synchronized output and copyable code |
| Your brand | Edit colors, size, speed, density, dot scale and cursor width |
| Real context | Simulate progress stages, streamed content, completion and stop |
| Integration | Review APIs, licensing, accessibility behavior and security scope |

<details>
<summary><strong>See the dark theme</strong></summary>

![Dark-mode showroom](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/gallery-dark.png)

</details>

![Design-token playground](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/playground.png)

## Response collections

**Not just an orb: a coordinated response from thought to completion.**
`ResponseExperience` composes existing primitives, with three opt-in treatments.
Open [the local comparison](http://127.0.0.1:5188/#collections) and play the same
simulated reply across all three, including completion and interruption states.

| Preset | Thinking | Text and cursor | Completion | Suggested context |
| --- | --- | --- | --- | --- |
| **Clear** | Mono Composing, short label shimmer | Soft fade, fine beam | Quiet confirmation and fading line | Long conversations, everyday work |
| **Aurora** | Solving, localized color aura | Blur-to-focus, breathing color dot | Multicolor fine-line finish | Branded assistants, creative work |
| **Glass** | Ping, frosted status with light sweep | Glyph fade, short-line cursor | Glass recedes | Tool and agent coordination |

Only the short status region gets glass or a glow, not the whole reply.
These original treatments draw on Fluent motion/material principles; they are
not Microsoft/Copilot components or pixel-identical recreations. See [NOTICE](NOTICE.md).

```tsx
import { ResponseExperience, type ResponsePhase } from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

export function Reply({ text, phase }: { text: string; phase: ResponsePhase }) {
  return (
    <ResponseExperience
      preset="clear"
      text={text}
      phase={phase}
      tokens={{ glyphFadeMs: 620, glassBlur: 14, sheenDurationMs: 3200 }}
      announce
    />
  );
}
```

The host drives `thinking → streaming → complete`; use `error` for failure,
or `idle` for stopped/history output, retaining the accumulated text.
There is no internal typing queue, server-content delay or automatic phase
progression. Use a new `key={messageId}` per reply, and announce shared progress
only once. `label` and `detail` accept public stage summaries; provide localized
labels for your product (defaults are Chinese).

Or mix the text treatments into your existing UI:

```tsx
<StreamingText text={text} phase="writing" reveal="soft" cursor="beam" />
// reveal: fade | soft | blur | none
// cursor: spectrum | beam | dot | line | none
```

Default fades are 620ms for Clear, 540ms for Aurora and 320ms for Glass.
`glyphFadeMs` overrides them. Reduced motion disables the animated treatments;
reduced transparency or missing backdrop-filter support gives Glass an opaque
fallback. Apply `darkTokens` or your own dark surface tokens in dark interfaces.

Documentation images remain actual **v0.2.1 captures**; they do not show or
validate the new v0.3.0 collections. View those in the local showroom.

## Business context

The value is feedback between people and systems, not a replacement backend:

| Scenario | Visible progress | Your application owns |
| --- | --- | --- |
| Enterprise knowledge | Understand → retrieve → compose | Retrieval, citations, access control |
| Industrial selection | Capture requirements → validate inputs → summarize | Product data, rules, compatibility review |
| Quotation handoff | Prepare specifications → hand off → summarize | Real prices, taxes, approval and commitments |

![Industrial-selection demonstration with visible stages](https://raw.githubusercontent.com/guidoshar/chat-motion-react/v0.2.1/docs/media/business-flow.png)

These are actual local-page screenshots, not mockups. Scenario content is
**simulated**, and the ¥100.00 quotation example is not a commercial offer.
The package connects to no knowledge base, product system or pricing service.

For product teams: consistent state language. For designers: understated,
unboxed motion and brand tokens. For developers: small typed APIs that work with
existing SSE/state machines. For maintainers: explicit licensing and security
boundaries, without claiming enterprise certification.

## Install

This project is published on GitHub, **not on the npm registry**. Download the
prebuilt `guidoshar-chat-motion-react-0.3.0.tgz` from the
[v0.3.0 release](https://github.com/guidoshar/chat-motion-react/releases/tag/v0.3.0),
compare its SHA-256 with the release, then install:

```powershell
Get-FileHash ./guidoshar-chat-motion-react-0.3.0.tgz -Algorithm SHA256
npm install ./guidoshar-chat-motion-react-0.3.0.tgz --ignore-scripts
```

Or install from a pinned Git tag (requires the npm `prepare` build script):

```powershell
npm install "git+https://github.com/guidoshar/chat-motion-react.git#v0.3.0"
```

ESM only. React 18.2 or 19 is a peer dependency. Package tooling requires Node
20.19+; use an actively supported Node.js release such as 22.12+ or 24+.
The declared React range is not a completed compatibility test matrix.

## Quick start

Import CSS once at your application's entry:

```tsx
import {
  MotionTheme, StatusPill, StreamingText, ThinkingOrb,
  type MotionTokens,
} from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

const theme = {
  cyan: '#21A8BD', blue: '#1775B9', violet: '#76518C',
  red: '#DB3B49', orange: '#F28B2C',
  orbInk: '#53627A', orbSize: 64, speed: 1,
  density: 1, dotScale: 1, cursorWidth: 3, glyphFadeMs: 260,
} satisfies MotionTokens;

export function Reply({ text, done }: { text: string; done: boolean }) {
  return (
    <MotionTheme tokens={theme}>
      <StatusPill
        variant="composing"
        label={done ? 'Complete' : 'Preparing your reply'}
        status={done ? 'success' : 'running'}
        announce
      />
      <p><StreamingText text={text} phase={done ? 'settled' : 'writing'} /></p>
    </MotionTheme>
  );
}

// Standalone, monochrome:
<ThinkingOrb variant="solving" size={80} colorMode="mono" label="Working" />;
```

Pass the **entire accumulated text**, not only the latest delta. The component
does not delay server content or simulate typing. Use `phase="idle"` for
history and a new `key={messageId}` for each new response.

## Variants

| Variant | Motion |
| --- | --- |
| `solving` | Layered dot lattice: quarter-turn scramble, reverse, rest |
| `composing` | Fixed-orientation broad dot ribbon with traveling undulations |
| `ping` | Spherical light ring, out and back in 4.2 seconds at 1× speed |
| `band` | Original rotating illuminated band |
| `ribbon` | Original spinning helical particle ribbon |

`orbVariants`, `OrbVariant` and `OrbColorMode` are exported for typed controls.
The default remains `band`. StatusPill has no box by default;
`appearance="soft"` opts into a light capsule.

## Design tokens

Use `MotionTheme` for a shared div wrapper, `motionTokens(theme)` on an existing
host element, or `tokens={theme}` on one instance. No Provider is required.
CSS custom properties use the `--cm-` prefix.

```css
.my-chat {
  --cm-orb-size: 64px;
  --cm-orb-ink: #53627a;
  --cm-speed: 1;
  --cm-density: 1;
  --cm-dot-scale: 1;
  --cm-cursor-width: 3px;
  --cm-glyph-fade: 260ms;
}
```

The five palette tokens and `orbInk` use six-digit HEX. Without orbInk, neutral
particles follow the surrounding computed text color (HEX/numeric RGB supported;
other color representations fall back to blue-gray). `palette` accepts up to
16 six-digit HEX stops and affects only that orb. `colorMode="mono"` removes
brand highlights. `darkTokens` exports a dark semantic-color preset.

Explicit size/speed/density/dotScale/palette props override style, then instance
tokens, then inherited CSS variables. Changes to ancestor style/class/data-theme
are observed; arbitrary CSSOM edits need one of these refresh signals.

Important bounds: orb size 16–192px, speed 0 (freeze) or 0.25–3×, density
0.5–1.5× (quantized to 0.25), dotScale 0.5–2×. Size-based detail reduces
particle counts at small sizes. Cursor width 1–8px, fades 0–2000ms.
See the [complete token table](README.md#token-对照).

Response-specific tokens (all optional):

| Token | CSS variable | Default / bounds |
| --- | --- | --- |
| `responseSurface` | `--cm-response-surface` | `rgba(247,250,255,.72)` |
| `responseBorder` | `--cm-response-border` | `#DCE6F0` |
| `responseRadius` | `--cm-response-radius` | 16px; 0–32px |
| `glassBlur` | `--cm-glass-blur` | 14px; 0–24px |
| `sheenDurationMs` | `--cm-sheen-duration` | 3200ms; 1200–8000ms |

Glass falls back to `surfaceColor` without backdrop-filter. Cursor width defaults
to 2px for beam and 3px otherwise; explicit tokens win. `cursorCycleMs` controls
color flow in spectrum/dot; beam/dot/line breathing uses 1700/1800/2100ms.

Token validation guards ordinary configuration mistakes. It is **not a hostile
CSS sanitizer**. Treat props/style/theme objects as trusted configuration.

## Props

- `ThinkingOrb`: variant, size, speed, paused, colorMode, density, dotScale,
  palette, label.
- `StatusPill`: required label; status running/success/error/idle; size sm/md/lg;
  appearance plain/soft; announce; variant/speed/paused/colorMode/density/
  dotScale/palette. Default icon sizes: 28/36/56px.
- `StreamingText`: required text; phase writing/settled/idle; paused;
  reveal fade/soft/blur/none; cursor spectrum/beam/dot/line/none.
- `ResponseExperience`: required text; preset clear/aurora/glass (default clear);
  phase thinking/streaming/complete/error/idle (default thinking); label, detail,
  paused and announce (both false by default). Default status icon/label: 32/13px.
- `responsePresets` exports each preset's orb, color mode, reveal and cursor
  mapping. `ResponsePreset`, `ResponsePhase`, `TextReveal` and `StreamCursor`
  are exported types.
- All components accept tokens, style and className.

## SSE integration

Keep your existing SSE parser: append deltas to state and change the phase on
completion/error. The [EventSource example](examples/SseReply.tsx) shows
same-origin GET transport, validation, cancellation and cleanup. For POST or
Authorization headers, use your own fetch/parser.

The example contract uses named events, each followed by a blank line:

```text
event: stage
data: {"label":"Looking up information"}

event: delta
data: {"text":"Hello"}

event: done
data: {}

```

`failed` indicates a service failure. The example closes on errors without
automatic replay. It limits JSON events to 65,536, labels to 160 and replies
to 200,000 UTF-16 code units; idle timeout is 45 seconds, total timeout 5 minutes.
SSE comment heartbeats do not reset that idle timer. These are example limits,
not server protections: browser buffering occurs before event callbacks.
Enforce authorization, quotas and size/rate limits on the server/proxy.
Never place secrets in browser code or query strings.

Display only public progress summaries, not private model reasoning.

## Accessibility, performance and integration

- No React per-frame state updates. requestAnimationFrame is time-based; no
  fixed frame rate is promised. DPR is capped at 2, mesh cache at 15 entries.
- Orbs stop offscreen/background/paused, at zero speed, with reduced motion or
  forced colors. Forced colors uses a static system-color ring.
- Pausing motion does not cancel a stream or block text updates.
- ResponseExperience also coordinates CSS motion with viewport/background
  visibility. Shimmer is restricted to the short public status label. Material
  blur is limited to the status surface; the reply remains unboxed.
- Only the newest 24 graphemes animate. Tail segmentation uses a 2,048-code-unit
  window, expanded if needed to preserve a boundary. Text is never truncated.
  Without Intl.Segmenter, fallback is code points, not full grapheme handling.
- Decorative by default; supply an orb label when used alone. Announce public
  status once. Stream text deliberately has no character-by-character live
  region; use a single completion announcement in the host.
- React text nodes only; no HTML or Markdown rendering.
- SSR render does not read window/document; client directives are preserved.
  In Next.js, import components from a client boundary and CSS in the root
  layout. This repository has not verified a Next.js integration.
- Reduced-motion/high-contrast hooks are implementations, not WCAG certification.

## Develop locally

```powershell
git clone git@github.com:guidoshar/chat-motion-react.git
cd chat-motion-react
npm ci
npm run dev
npm run build:demo
npm run check:package
npm pack
```

Demo: http://127.0.0.1:5188. Simulated data only; no model calls or hosted service.

With the preview running and Chrome installed, `npm run capture:docs` uses
project-local Playwright and an isolated headless browser to regenerate the
documentation screenshots. It does not use your browser profile or run in CI.
Documentation images live in the repository, not in the runtime package.

v0.3.0 verification covers TypeScript/package/demo builds and static package
inventory checks only. No new runtime tests, screenshots or browser checks were
run for this release; validate the new treatments in your host environment.
The retained v0.2.1 screenshots came from a focused desktop Chrome check after
fixing the demo's JSX runtime (`React is not defined`), not the new collections.
This is not a full regression, cross-browser, React-version, accessibility or
security certification. See
[CONTRIBUTING](CONTRIBUTING.md) for the production acceptance checklist.

## License

MIT. Solving/composing adapt Jakub Antalik's MIT Libraries.dev geometry; complete
copyright/license text is in [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md).
Ping is independently implemented from MetalForge's public visual description,
not its paid shader export. Default colors are an approximate brand-inspired
screen palette, not official brand specifications. No third-party logos,
mascots or affiliation are included; see [NOTICE](NOTICE.md).
