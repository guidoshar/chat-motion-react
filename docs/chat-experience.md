# Composable chat presentation · v0.3

The core entry needs only React. All text, states and public progress come from
the caller. No transport, backend, chart library, persistence or model SDK is
included. Existing v0.2 orb geometry and props remain compatible.

## Start with one accent

```tsx
import { ChatResponse, MotionTheme, createMotionTokens } from '@guidoshar/chat-motion-react';
import '@guidoshar/chat-motion-react/styles.css';

const tokens = createMotionTokens('#486b88', {
  panelRadius: 12,
  responseFontSize: 16,
  collapseMs: 600,
});

export function Reply({ text, done }: { text: string; done: boolean }) {
  return <MotionTheme tokens={tokens}>
    <ChatResponse text={text} phase={done ? 'complete' : 'streaming'} />
  </MotionTheme>;
}
```

`createMotionTokens` takes a six-digit hex accent and derives coordinated orb,
cursor, highlight, panel and link colors. Overrides win. It produces a light,
neutral surface palette; arbitrary accents do not guarantee readable contrast.
Choose contrasting text/link overrides for your host. No font is installed.

Use `MotionTheme` for a scope, `tokens` on a component for a local override, or
`motionTokens(tokens)` on any host element. Normal CSS variables also work:

```css
.conversation {
  --cm-accent: var(--brand-accent);
  --cm-subtle: var(--surface-tinted);
  --cm-text: var(--text-primary);
  --cm-muted: var(--text-secondary);
  --cm-surface: var(--surface-primary);
  --cm-border: var(--border-subtle);
}
```

Canvas palette stops (`cyan`, `blue`, `violet`, `red`, `orange`, `orbInk`) use
six-digit hex; the semantic surface/text tokens accept CSS colors/variables.
Use `createMotionTokens` when changing both canvas and CSS colors together.

| New token | CSS variable | Meaning / bounded numeric range |
| --- | --- | --- |
| accentColor | --cm-accent | Main accent, stage dots and cursor fallback |
| highlightColor | --cm-highlight | Animated label highlight |
| subtleColor | --cm-subtle | Tinted panel/header surface |
| linkColor | --cm-link | Links and keyboard focus |
| codeBackgroundColor / codeTextColor | --cm-code-background / --cm-code-text | Markdown code surfaces |
| panelRadius / panelPadding | --cm-panel-radius / --cm-panel-padding | 0–40 / 0–48 px |
| responseFontSize | --cm-response-font-size | 12–32 px |
| responseLineHeight | --cm-response-line-height | 1–2.5 |
| orbTransitionMs | --cm-orb-transition | 0–3000 ms |
| collapseMs / expandMs | --cm-collapse / --cm-expand | 0–3000 ms |
| sheenCycleMs | --cm-sheen-cycle | 500–10000 ms |

Existing palette, status, surface, typography and cursor tokens still work;
see [MotionTokens](../src/tokens.ts). Unknown keys and unsafe/common malformed
values are ignored by `motionTokens`. Treat configuration and React slots as
trusted application code, not a sanitizer for untrusted objects.

## Components

| Export | Purpose | Main controls |
| --- | --- | --- |
| ThinkingOrb | Five original canvas animations | variant, paused, size, density, palette |
| TransitionOrb | Crossfade/morph between those variants | Same props; at most two layers |
| StatusPill | Orb + visible state label | transition, animatedLabel (both opt-in), status, announce |
| ThinkingIndicator | Waiting copy and orb rotation | active, messages, variants, messageIntervalMs, variantIntervalMs |
| ActivityPanel | Collapsible public progress | runId, label, state, steps, summary, expanded, onExpandedChange |
| StreamingText | Immediate plain text with animated tail/cursor | text, phase, paused |
| ChatResponse | Optional composition of the above | text, phase, activity, waiting, renderText, result, actions |
| useStreamingReveal | Optional presentation buffer | id, text, complete, historical, interrupted, enabled |

Waiting defaults to copy changes every 5 seconds and orb changes every 15
seconds. These are visual waiting states, not invented backend tasks. Pass
`active={false}` or change `ChatResponse.phase` when actual output arrives.
Waiting announcements are off by default to avoid repeated screen-reader copy.
Pausing animation never cancels your request or suppresses incoming text.

`ChatResponse.phase` is `waiting | thinking | streaming | complete | error |
cancelled`. Plain text is the default. `labels` can localize status text;
`waiting.messages` overrides the waiting label. A supplied activity panel owns
its own `label`. Use `historical` for stored replies: no waiting/reveal replay.

`ActivityPanel` takes an array of `{ id, label, state, description?, duration?,
variant? }`. Step state additionally allows `pending` and `skipped`. IDs must be
unique. The panel opens while running and closes on completion, error or
cancellation. Users can reopen it. `expanded` and `onExpandedChange` let the host
own disclosure; `runId` resets manual expansion for a new request. Collapsed
content is inert/hidden from assistive technology and its step orbs are paused.
`summary` is an approved public summary, never hidden model reasoning.

## Optional chart, table or attachment

```tsx
<ChatResponse
  text={replyText}
  phase={finished ? 'complete' : 'streaming'}
  activity={{
    runId: requestId,
    label: finished ? 'Response ready' : 'Request progress',
    steps: publicSteps,
  }}
  result={showChart ? <YourChart data={chartData} /> : undefined}
  actions={finished ? <button onClick={copyReply}>Copy response</button> : undefined}
/>
```

`result` is any React node. Omit it for a text-only chat. It is shown at a terminal
phase (including error/cancelled) or for history; use `resultWhen="always"` for
live content. Decide in your application whether a partial result is suitable
after failure. The component does not load a charting library.

## Optional Markdown entry

Only install these peers if you use Markdown:

```powershell
npm install react-markdown remark-gfm
```

```tsx
import { StreamingMarkdown } from '@guidoshar/chat-motion-react/markdown';

<ChatResponse text={replyText} phase="streaming"
  renderText={props => <StreamingMarkdown {...props} />} />
```

GFM lists, tables, code and links receive scoped token styling. Raw HTML is
disabled and the parser's default URL filtering remains enabled. Images render
as alt text by default, so Markdown does not silently fetch remote image URLs.
Set `allowImages` only for trusted/approved content; rendered images may issue
network requests. Links remain navigable user content. Host link, image, CSP and
content policies still apply. The core entry never imports this renderer.

## Optional streaming presentation buffer

`StreamingText` still presents received text immediately. To opt into pacing:

```tsx
const display = useStreamingReveal({
  id: requestId, text: accumulatedText, complete: transportDone,
  interrupted: failed || cancelled, historical,
  charactersPerSecond: 80, maxTailMs: 1200,
});

<ChatResponse text={display.text} historical={historical}
  phase={failed ? 'error' : cancelled ? 'cancelled' : display.complete ? 'complete' : 'streaming'} />
```

Store received text independently of the presentation buffer. The hook uses one
timer, flushes on interruption/history/background/reduced motion, and respects
grapheme boundaries with `Intl.Segmenter` (surrogate-safe fallback). Speed is
bounded to 1–2000 code units/second, adjusted to grapheme boundaries. Final
catch-up is bounded to 0–6000 ms plus timer scheduling, default 1200 ms. Changing
`id` or replacing text resets the presentation. No queues or network handles
are retained outside the mounted hook.

## Local preview and integration

Run `npm ci`, `npm run dev`, then open
http://127.0.0.1:5188/?view=chat (standalone, responsive), or `/#experience` in the
desktop showroom. Use the phase buttons, accent picker and
Markdown/chart switches with synthetic data only. No public hosting is needed.

Version 0.3 is available as source on `main`, not an npm-registry release. To consume
the checked-out source locally, run `npm run build`, `npm pack`, then install
the generated `.tgz` in your application. See [example](../examples/ChatExperience.tsx).
The application is not automatically migrated by this extraction.

The complete demo source is also on `main`. Build the static site with
`npm run build:demo` and serve `demo-dist/` on your own ECS/Nginx host;
see [self-hosting](self-hosting.md). `npm run preview:demo` checks the production
output locally on port 5189.

Tests cover state transitions, token bounds, StrictMode cleanup, public-summary
disclosure, Unicode streaming and Markdown boundaries. Run `npm test`,
`npm run build:demo` and `npm run check:package`. CI exercises React 18.3.1 and
19.2.0. Browser/assistive-technology validation remains the host's responsibility.
`npm run check:experience` runs focused local Chrome interactions with the demo
already running; see [Contributing](../CONTRIBUTING.md).
