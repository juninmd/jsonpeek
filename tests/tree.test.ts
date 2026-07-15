import { test, expect } from "bun:test";
// lib.js exports via module.exports (dual classic/CJS); bun interops.
import lib from "../lib.js";
const { classify, escapeHtml, buildJsonTree } = lib as any;

test("classify distinguishes json types", () => {
  expect(classify(null)).toBe("null");
  expect(classify([])).toBe("array");
  expect(classify({})).toBe("object");
  expect(classify("x")).toBe("string");
  expect(classify(1)).toBe("number");
  expect(classify(true)).toBe("boolean");
});

test("escapeHtml neutralizes markup", () => {
  expect(escapeHtml('<img src=x onerror="y">')).toBe("&lt;img src=x onerror=&quot;y&quot;&gt;");
});

test("leaf values get typed spans", () => {
  expect(buildJsonTree("hi")).toContain('class="jp-str"');
  expect(buildJsonTree(42)).toContain('class="jp-num"');
  expect(buildJsonTree(false)).toContain('class="jp-bool"');
  expect(buildJsonTree(null)).toContain('class="jp-null"');
});

test("objects render collapsible nodes with keys and count", () => {
  const html = buildJsonTree({ name: "juninho", age: 30 });
  expect(html).toContain("<details");
  expect(html).toContain('class="jp-key">name');
  expect(html).toContain('class="jp-count">2');
  expect(html).toContain('class="jp-str">"juninho"');
});

test("empty containers render inline", () => {
  expect(buildJsonTree({})).toBe('<div class="jp-row">{}</div>');
  expect(buildJsonTree([])).toBe('<div class="jp-row">[]</div>');
});

test("nested structures recurse", () => {
  const html = buildJsonTree({ items: [1, 2] });
  expect(html).toContain('class="jp-key">items');
  expect(html).toContain('class="jp-num">1');
  expect(html).toContain('class="jp-num">2');
});

test("XSS in values is escaped, not executed", () => {
  const html = buildJsonTree({ evil: "<script>alert(1)</script>" });
  expect(html).not.toContain("<script>alert");
  expect(html).toContain("&lt;script&gt;");
});
