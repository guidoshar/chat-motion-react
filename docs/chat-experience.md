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
| ActivityPanel | Collapsible public progress | runId, label, state, steps, summary, autoExpanded, expanded, onExpandedChange |
| StreamingText | Immediate plain text with animated tail/cursor | text, phase, paused |
| ChatResponse | Composes waiting, process, text, pacing and completion surface | responseId, text, phase, activity, presentation, surface, result, actions |
| ChatConversation | Bounded scroll viewport; pauses when the reader takes over | followKey, resumeLabel, bottomThreshold, style |
| useChatAutoScroll | Same scroll behavior for a custom viewport | changes, { followKey, bottomThreshold } |
| useStreamingReveal | Optional presentation buffer | id, text, complete, historical, interrupted, enabled |
| MarkdownResponse (from /markdown) | Ready-made Markdown reply, paced with completion framing | ChatResponse props, markdown.allowImages |

Waiting defaults to copy changes every 5 seconds and orb changes every 15
seconds. These are visual waiting states, not invented backend tasks. Pass
`active={false}` or change `ChatResponse.phase` when actual output arrives.
Waiting announcements are off by default to avoid repeated screen-reader copy.
Pausing animation never cancels your request or suppresses incoming text.

`ChatResponse.phase` is `waiting | thinking | streaming | complete | error |
cancelled | incomplete`. Plain text is the default. `labels` localizes status
text (including `presenting`, while the display buffer catches up).
`waiting.messages` overrides the waiting label. An activity panel can supply
its own `label`; otherwise it uses the localized response label. The display
completion label takes precedence while the buffer is still catching up.
Use `historical` for stored replies: no waiting/reveal replay. A reply first
mounted in a terminal phase also displays its text immediately. Change
`responseId` for every new reply to reset both pacing and manual disclosure.

`ActivityPanel` takes an array of `{ id, label, state, description?, duration?,
variant? }`. Step state additionally allows `pending` and `skipped`. IDs must be
unique. By default the standalone panel opens while running and closes on a
terminal state. In `ChatResponse` it closes when the first text arrives.
`autoExpanded` adjusts that automatic behavior; a user's manual choice persists
until the next `runId`. `expanded` and `onExpandedChange` let the host own
disclosure. Only the header has an orb by default; `transition` enables the
two-layer dissolve and `stepIndicators="orbs"` opts into animated step markers. Collapsed
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

`result` is any React node. Omit it for a text-only chat. The default
`resultWhen="complete"` waits for successful completion AND the display buffer
to drain. Errors, cancellation and incomplete output keep partial text but do
not show a successful result or completion frame. Use `resultWhen="terminal"`
to explicitly allow partial results, or `"always"` for live content. `actions`
appears after any terminal state once the display drains, so retry/copy remains
available after interruption. The component does not load a charting library.

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
The one visible tail cursor is placed inside the last paragraph, list item,
heading, code block or table region. Table overflow stays in a keyboard-focusable
region instead of widening the conversation.

## Ready-made customer chat: change tokens, keep the components

```tsx
import { ChatConversation, MotionTheme, createMotionTokens } from '@guidoshar/chat-motion-react';
import { MarkdownResponse } from '@guidoshar/chat-motion-react/markdown';
import '@guidoshar/chat-motion-react/styles.css';

// Keep this object in the customer's theme file.
const customerTheme = createMotionTokens('#184c8c', {
  panelRadius: 0,
  panelPadding: 20,
  responseShadow: '0 2px 16px rgb(15 30 50 / .06)',
  conversationMaxWidth: 1000,
  conversationPadding: 20,
  messageGap: 24,
  responseFontSize: 16,
  responseLineHeight: 1.7,
  orbSize: 46,
  collapseMs: 900,
  expandMs: 420,
  revealCharactersPerSecond: 80,
  revealTailMs: 1200,
});

<MotionTheme tokens={customerTheme}>
  <ChatConversation style={{ height: '70vh' }}
    followKey={submissionId} resumeLabel="Jump to latest">
    {replies.map(reply => <MarkdownResponse key={reply.id}
      responseId={reply.id} text={reply.text} phase={reply.phase}
      historical={reply.historical} activity={{ steps: reply.publicSteps }}
      result={reply.attachment} actions={reply.actions} />)}
  </ChatConversation>
</MotionTheme>
```

`MarkdownResponse` defaults to `presentation={true}` and
`surface="completion"`. Plain `ChatResponse` retains immediate text and an
unframed layout for existing consumers; opt into those same props when desired.
The surface stays mounted and transparent while processing, then gains its
token-defined background, border and shadow only when visible text has settled.
Paused, historical, interrupted and reduced-motion replies flush immediately.

See the complete [customer chat](../examples/CustomerChat.tsx) and
[three synthetic customer themes](../examples/customerThemes.ts). The markup
stays identical across square navy, rounded warm and dark themes. No customer
logo, backend URL, credential or domain data is embedded in the library.

| Additional token | CSS variable | Meaning / bounded numeric range |
| --- | --- | --- |
| fontFamily / codeFontFamily | --cm-font-family / --cm-code-font-family | Host-approved CSS font stacks; no font downloads |
| conversationMaxWidth | --cm-conversation-max-width | Reading width, 240–2400 px |
| conversationPadding / messageGap | --cm-conversation-padding / --cm-message-gap | Viewport inset / spacing between messages, 0–80 px |
| responseGap | --cm-response-gap | Spacing inside a response, 0–48 px |
| responseSurfaceColor | --cm-response-surface | Completed answer background; derived from accent by createMotionTokens |
| responseShadow | --cm-response-shadow | CSS box-shadow, including `none` |
| responseTransitionMs | --cm-response-transition | Completion surface transition, 0–3000 ms |
| activityDotOpacity | --cm-activity-dot-opacity | Header decoration opacity, 0–1 |
| revealCharactersPerSecond | --cm-reveal-rate | Display speed, 1–2000 code units/s, adjusted to grapheme boundaries |
| revealTailMs | --cm-reveal-tail | Maximum display catch-up, 0–6000 ms |
| waitingMessageMs / waitingVariantMs | --cm-waiting-message / --cm-waiting-variant | Waiting copy / orb change interval, 1000–60000 ms |

Colors, fonts, spacing, radius, shadow and motion live in tokens. Text, locale,
public process steps, network phase and whether to allow partial results remain
component inputs: they are business behavior, not brand styling. Numeric tokens
are finite and bounded; malformed/unsafe CSS values are ignored. Explicit props
override timing tokens. As with other tokens, CSS values are trusted theme
configuration, not untrusted model output.

The integrated response reads timing tokens inherited through `MotionTheme`,
component `tokens`, or CSS variables. Standalone `ThinkingIndicator` reads these
same waiting tokens. Changes to ancestor `style`, `class` and
`data-theme` and viewport resize refresh those values. Direct CSSOM edits require
an accompanying attribute update. `useStreamingReveal` is a DOM-independent hook
with explicit timing options. No component requires a provider.

## Following output without interrupting reading

`ChatConversation` observes both the viewport and its content, coalescing resize
and streamed-text updates into one animation frame. Wheel-up, touch, keyboard
reading, pointer selection and manual process expansion pause following.
Scrolling downward to the bottom resumes it. Set `followKey` to a new user
submission ID to resume for a new question, not to the current streamed text.
An optional `resumeLabel` enables a sticky resume button. Native event handlers
are composed with the internal behavior. No window/document scrolling occurs.

For a custom layout use `useChatAutoScroll(changes, { followKey })`. Attach
`scrollRef` to a bounded viewport and `contentRef` to its contents, and bind
`onScroll`, `onWheel`, `onPointerDown`, `onTouchStart`, `onTouchMove`, `onKeyDown`.
It also returns `follow`, `pauseFollowing` and `isFollowing`. Wrap child process
panels with `<ChatScrollPauseContext.Provider value={pauseFollowing}>` to share
the same inspection boundary. Observers and scheduled frames are cleaned up on
unmount, including React StrictMode.

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
