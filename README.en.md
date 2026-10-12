# Chat Motion React

[中文文档 and full token table](README.md) · [Security](SECURITY.md) · [License notices](THIRD_PARTY_NOTICES.md)

Small, themeable React components for thinking-state animations and streamed
text with a multicolor cursor. Canvas 2D + CSS + TypeScript. No UI framework,
model SDK, remote assets, telemetry or runtime dependency other than React.

This is a **presentation library**: you own the transport, authentication,
content and public progress stages. Design tokens are colors/sizes, not API keys.

## Install

This project is published on GitHub, **not on the npm registry**. Download the
prebuilt `guidoshar-chat-motion-react-0.2.0.tgz` from the
[v0.2.0 release](https://github.com/guidoshar/chat-motion-react/releases/tag/v0.2.0),
compare its SHA-256 with the release, then install:

```powershell
Get-FileHash ./guidoshar-chat-motion-react-0.2.0.tgz -Algorithm SHA256
npm install ./guidoshar-chat-motion-react-0.2.0.tgz --ignore-scripts
```

Or install from a pinned Git tag (requires the npm `prepare` build script):

```powershell
npm install "git+https://github.com/guidoshar/chat-motion-react.git#v0.2.0"
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

Token validation guards ordinary configuration mistakes. It is **not a hostile
CSS sanitizer**. Treat props/style/theme objects as trusted configuration.

## Props

- `ThinkingOrb`: variant, size, speed, paused, colorMode, density, dotScale,
  palette, label.
- `StatusPill`: required label; status running/success/error/idle; size sm/md/lg;
  appearance plain/soft; announce; variant/speed/paused/colorMode/density/
  dotScale/palette. Default icon sizes: 28/36/56px.
- `StreamingText`: required text; phase writing/settled/idle; paused.
- All three accept tokens, style and className.

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
Build/package checks are the current release verification scope, not runtime or
browser tests. See [CONTRIBUTING](CONTRIBUTING.md) for the acceptance checklist.

## License

MIT. Solving/composing adapt Jakub Antalik's MIT Libraries.dev geometry; complete
copyright/license text is in [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES.md).
Ping is independently implemented from MetalForge's public visual description,
not its paid shader export. Default colors are an approximate brand-inspired
screen palette, not official brand specifications. No third-party logos,
mascots or affiliation are included; see [NOTICE](NOTICE.md).
