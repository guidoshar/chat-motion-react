# Changelog

## 0.3.0

### Added

- Three coordinated response collections: Clear (quiet shimmer, soft text,
  beam cursor), Aurora (local color aura, blur-to-focus text, breathing dot),
  and Glass (frosted status, light sweep, short-line cursor).
- `ResponseExperience` composes public status, streamed text and completion
  treatment. The host owns thinking/streaming/complete/error/idle transitions.
- Exported `responsePresets`, `ResponsePreset`, `ResponsePhase` and typed props.
- Additive `StreamingText.reveal` and `cursor` controls. Existing fade/spectrum
  defaults and standalone component APIs remain unchanged.
- Glass surface/border/radius/blur and shimmer-duration design tokens.
- Synchronized local collection comparison, phase controls, material controls
  and copyable integration snippets.

### Boundaries and verification

- No new runtime dependency, network call, telemetry or simulated phase logic
  in the library. Only the explicitly labeled showroom uses timed mock output.
- Response motion respects reduced motion, forced colors, page/viewport
  visibility and pause. Glass has opaque and reduced-transparency fallbacks.
- TypeScript/package/demo builds and static publish-inventory checks only.
  No new runtime tests, screenshots or browser checks were run for this release.
- README images remain explicitly labeled v0.2.1 captures. New collections
  require host-product visual, browser and accessibility acceptance.

## 0.2.1

### Fixed

- Configure the automatic React JSX runtime explicitly for Vite development and
  production. The previous demo could build but open blank with
  `React is not defined` because Vite did not discover tsconfig.demo.json.

### Added

- Desktop showroom with all five orbs, design-token controls, custom palette
  inputs, copyable React code and status/streaming examples.
- Three clearly labeled business simulations: enterprise knowledge, industrial
  selection and quotation handoff. No business backend or data is included.
- Chinese/English README presentation with real light/dark, playground and
  business-flow screenshots, product context and explicit integration boundaries.
- Opt-in local screenshot script using a separate headless Chrome process.
  Playwright is development-only and screenshots are excluded from the package.

### Verification

- Package/demo builds, publish inventory check and focused desktop Chrome
  screenshot/interactions. No full regression or cross-browser test matrix.
- Core component APIs and geometry are unchanged from 0.2.0.

## 0.2.0

### Added

- `solving`: layered lattice scramble, reverse and rest.
- `composing`: fixed-orientation, undulating particle ribbon.
- Brand/monochrome mode, neutral ink, density and dot-scale design tokens.
- Size-based geometry detail and a bounded 15-entry mesh cache.
- Forced-colors fallback, logical cursor positioning and subtle orb entrance.
- Chinese/English guides, security boundaries, contribution checklist, complete
  upstream MIT notices and build-only CI/package inventory checks.

### Improved

- `ping` now follows an out-and-back spherical light ring on a 4.2-second cycle.
- Stream tail segmentation uses a bounded trailing window in the ordinary case
  and preserves grapheme boundaries and full reply text.
- Token helper rejects unknown keys, invalid types and unsafe/common malformed
  CSS input, and clamps finite numeric controls.
- EventSource example validates same-origin URLs, bounds payload/reply lengths,
  applies idle/total timeouts and ignores callbacks after cancellation.
- Local demo showcases all five variants, themes, sizing and a simulated stream.

### Compatibility and verification

- Existing `band`, `ribbon`, default plain status styling and text APIs remain.
  Ping changes visually; explicitly opt for another variant if needed.
- Invalid/out-of-range token values are now ignored/clamped rather than passed
  through. CSS/style remains a trusted, advanced customization escape hatch.
- React 18.2/19 peer declaration and ESM-only distribution remain unchanged.
- TypeScript/package/demo builds and packaging/dependency checks are the release
  verification scope. No runtime tests, browser checks, independent security
  audit or compliance certification were performed.

## 0.1.0

- Initial standalone release: band, ping, ribbon, status text, streaming cursor,
  shared design tokens and a local demonstration.
