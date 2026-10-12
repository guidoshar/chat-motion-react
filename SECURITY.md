# Security policy

## Scope and supported versions

Security fixes target the latest 0.x release. This is a presentation library,
not an authentication, transport, authorization or HTML sanitization framework.
No independent security audit or enterprise compliance certification has been
performed. A successful build or dependency audit is not a security guarantee.

## Report privately

Use [GitHub private vulnerability reporting](https://github.com/guidoshar/chat-motion-react/security/advisories/new).
Include affected version, reproduction, impact and a minimal redacted example.
Do not put exploits, customer data, credentials or tokens in a public issue.
If private reporting is unavailable, open an issue requesting a private contact
without disclosing vulnerability details. No response-time SLA is promised.

## Implemented boundaries

- Runtime components make no network requests, use no telemetry, load no remote
  assets, read no credentials and write no persistent storage.
- Text is rendered through React text nodes, not HTML, Markdown, eval or script
  injection. This prevents interpreting text as markup; it does not detect
  misleading content, Unicode bidi spoofing or sensitive data.
- Canvas size, speed, particle density, dot scale, DPR and geometry cache are
  bounded. Loops stop offscreen, in background tabs, when paused or with reduced
  motion / forced colors. These limits are per instance, not a global CPU quota.
- The token helper accepts known keys, finite numeric values and bounded
  dimensions; rejects invalid palette values and common CSS URL/declaration
  input. It is a configuration guard, not a security parser for hostile CSS.
- Runtime dependencies consist of the host's React peer; build/demo tooling is
  separate. Release assets are prebuilt and include license notices.

## Host application responsibilities

1. Treat styles, CSS variables, palette configuration and endpoint URLs as
   trusted application configuration. Do not pass arbitrary remote objects or
   objects with getters into props/token helpers. The `style` escape hatch
   deliberately supports normal React styles and bypasses helper validation.
2. Bound incoming text, event size/rate, concurrent streams and component count.
   The core renderer does not truncate replies. Enforce limits on the server
   and proxy before a browser buffers oversized SSE frames.
3. Keep API keys and model credentials on the server. Authenticate streams,
   authorize each resource and tenant, set secure cookie/CORS policies, protect
   state-changing requests and apply quotas. Never put credentials in URLs.
4. The EventSource example restricts URLs to same-origin HTTP(S), validates JSON,
   limits event/reply lengths, closes on cancellation/error, rejects late
   callbacks and applies idle/total timeouts. Same-origin is not authorization.
   EventSource redirects and server behavior remain part of your threat model.
   Automatic reconnect/replay is intentionally disabled.
5. Enforce a Content Security Policy suitable for your app. Component token
   props use React inline styles; an organization disallowing inline styles
   should supply class-based CSS variables and omit style/token/size overrides.
   Compatibility with any particular strict CSP has not been verified.
6. Review the lockfile and dependency advisories, pin release versions, verify
   downloaded assets' SHA-256 and retain licenses. A checksum verifies bytes,
   not publisher identity, provenance attestation or audit status.
7. Validate accessibility and browser/SSR integration in your own environment.
   Labels must describe public task progress, not expose private model reasoning.

## Packaging and CI

The package allowlist contains only built components, the SSE example, package
metadata and public documentation/licenses. `npm run check:package` checks that
inventory and common credential patterns; it is not a comprehensive secret
scanner. CI uses pinned action revisions, read-only repository permissions, no
secrets and no deployment. The local demo binds to loopback by default.
