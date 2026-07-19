# AGENTS.md

Guidance for AI agents and contributors working in this repo.

## What this is

`jsonpeek` — a zero-dependency **Chrome MV3** content-script extension that renders raw JSON responses as a collapsible, searchable tree, entirely client-side. No build step, no bundler, no runtime deps.

## Stack & commands

- Plain ES modules + MV3 manifest. No transpile.
- **Tests:** [Bun](https://bun.sh) — `bun test` (covers the pure tree builder and XSS escaping).

```bash
bun test
# package for the Web Store:
zip -r jsonpeek.zip manifest.json lib.js content.js content.css
```

## Layout

| File            | Responsibility                                                    |
| --------------- | ----------------------------------------------------------------- |
| `lib.js`        | Pure `buildJsonTree` — **no DOM**, fully unit-tested. Logic lives here. |
| `content.js`    | JSON-doc detection + viewer/toolbar rendering (DOM side).         |
| `content.css`   | Dark theme.                                                       |
| `manifest.json` | MV3 manifest.                                                     |
| `tests/`        | `bun test` specs.                                                 |

## Conventions

- **Security first:** all JSON values are HTML-escaped before insertion — never introduce `innerHTML` with unescaped content. There is an XSS-escaping test; keep it passing.
- Keep parsing/tree logic in `lib.js` (testable, DOM-free); keep DOM work in `content.js`.
- Data never leaves the browser — do not add network calls.
- No runtime dependencies; no build tooling.
- Bump `manifest.json` `version` on user-facing changes.

## Definition of done

`bun test` green, extension loads unpacked and renders a JSON endpoint, no unescaped HTML paths.
