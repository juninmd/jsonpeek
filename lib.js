// Pure JSON → HTML tree builder. Shared by the content script (classic script)
// and the test suite (CommonJS require). No DOM access here.

function classify(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v; // "object" | "string" | "number" | "boolean"
}

const HTML_ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "`": "&#96;" };

// Escapes HTML-significant chars (incl. ' and `, so it is also safe inside
// single-quoted attributes) and shows invisible control / bidi-override chars
// as visible \uXXXX text to avoid visual spoofing of values.
function escapeHtml(s) {
  return String(s)
    .replace(/[&<>"'`]/g, (c) => HTML_ESC[c])
    .replace(/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

// MUST be used for any JSON-derived text placed in an HTML attribute.
const escapeAttr = escapeHtml;

function leaf(v) {
  const t = classify(v);
  if (t === "string") return `<span class="jp-str">"${escapeHtml(v)}"</span>`;
  if (t === "number") return `<span class="jp-num">${v}</span>`;
  if (t === "boolean") return `<span class="jp-bool">${v}</span>`;
  return `<span class="jp-null">null</span>`;
}

// Recursively render a parsed JSON value. Objects/arrays become collapsible
// <details>; primitives become a <div class="jp-row"> carrying searchable text.
function buildJsonTree(value, key) {
  const t = classify(value);
  const keyHtml = key !== undefined ? `<span class="jp-key">${escapeHtml(key)}</span>: ` : "";

  if (t === "object" || t === "array") {
    const entries = t === "array" ? value.map((v, i) => [i, v]) : Object.entries(value);
    const open = t === "array" ? "[" : "{";
    const close = t === "array" ? "]" : "}";
    if (entries.length === 0) return `<div class="jp-row">${keyHtml}${open}${close}</div>`;
    const children = entries.map(([k, v]) => buildJsonTree(v, t === "array" ? undefined : k)).join("");
    return (
      `<details class="jp-node" open><summary>${keyHtml}${open} ` +
      `<span class="jp-count">${entries.length}</span></summary>` +
      `<div class="jp-children">${children}</div><div class="jp-close">${close}</div></details>`
    );
  }
  return `<div class="jp-row">${keyHtml}${leaf(value)}</div>`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { classify, escapeHtml, escapeAttr, leaf, buildJsonTree };
}
