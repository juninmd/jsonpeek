// Pure JSON → HTML tree builder. Shared by the content script (classic script)
// and the test suite (CommonJS require). No DOM access here.

function classify(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v; // "object" | "string" | "number" | "boolean"
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

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
  module.exports = { classify, escapeHtml, leaf, buildJsonTree };
}
