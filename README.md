# 🔍 jsonpeek

A zero-dependency **Chrome (MV3) extension** that turns raw JSON API responses into a **pretty, collapsible, searchable tree** — right in the tab. No "view source", no online formatters (your data never leaves the browser).

## Features
- Auto-activates only when the document is JSON (`application/json`, or a lone `<pre>` of valid JSON).
- Collapsible tree with syntax colors; **expand / collapse all**.
- **Filter** box (live substring search), **copy** (re-serialized), **raw ⇄ tree** toggle.
- Values are HTML-escaped — a malicious string in the JSON can't inject markup.

## Install (unpacked)
1. `chrome://extensions` → enable **Developer mode**.
2. **Load unpacked** → select this folder.
3. Open any JSON endpoint (e.g. an API `…/health`).

## Layout
- `lib.js` — pure `buildJsonTree` (unit-tested, no DOM).
- `content.js` — detects JSON docs and renders the viewer + toolbar.
- `content.css` — dark theme.
- `manifest.json` — MV3.

## Dev
```bash
bun test    # tree builder + XSS-escaping tests
```

## Package for the Web Store
```bash
zip -r jsonpeek.zip manifest.json lib.js content.js content.css
```

MIT.
