# Contributing

Thanks for helping make waiting feel thoughtful. Keep this package small,
framework-neutral, accessible and honest about what it does.

## Local development

Use Node.js 22.12+ or 24+, npm and project-local dependencies. No global install,
Docker, hosted preview or credentials are required. PowerShell commands:

```powershell
npm ci
npm run dev
npm run build:demo
npm run check:package
```

The preview runs at http://127.0.0.1:5188. The build type-checks both package and
demo. Package checking inspects the publish allowlist and common secret patterns;
neither command substitutes for runtime tests. Do not add install-time network
calls, analytics, model services, mandatory UI frameworks or remote assets.

## Changes and attribution

- Keep existing public props compatible. Explain visual changes in CHANGELOG.
- Use typed tokens with bounds; preserve pause and reduced-motion behavior.
- Keep dynamic geometry counts/cache bounded and work outside React render loops.
- Never use `dangerouslySetInnerHTML` for streamed text.
- Include original licenses for adapted code. Paid or unlicensed exports are not
  acceptable contributions. Do not include private business assets or credentials.
- Explain what was built, what was checked and what was not checked in the PR.

## Production acceptance checklist

These are recommended checks for adopters/contributors, **not claims that the
v0.2.0 release has completed them**. Follow the host project's authorization and
test conventions before running them.

- React 18 and 19, StrictMode mount/unmount, multiple concurrent instances.
- Chromium, Firefox and Safari; DPR/zoom changes, long-running animations.
- Empty/long text, emoji/combining marks, mixed RTL, interrupted streams.
- Pause/resume, offscreen/background tabs, reduced motion and forced colors.
- Keyboard focus, screen reader announcements, selected theme contrast.
- SSR/hydration and the host's CSP.
- Stream ownership, cancellation races, reconnect protocol, server limits.
- Profiling representative hardware: no guaranteed 60/120 fps is claimed.

CI currently builds and checks packaging only. There is no automated runtime or
browser regression suite in this release. Add approved regression coverage
before making wider compatibility or performance guarantees.

## Documentation screenshots

Run `npm run dev`, then explicitly run `npm run capture:docs` in another
terminal with Chrome installed. It uses project-local Playwright in an isolated
headless process and only allows the local preview origin. It captures the
light/dark showroom, token playground and one completed business demonstration,
and reports uncaught page errors. It never attaches to a personal browser.
CI does not run this script or install a browser.

Screenshots are public, synthetic demo content; keep customer data and actual
prices out of them. Inspect the output before committing. These focused checks
do not replace a cross-browser or complete regression suite.
