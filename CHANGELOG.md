# Changelog

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
