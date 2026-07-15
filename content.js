// jsonpeek content script (classic). Runs on every page; only activates when the
// document is raw JSON. `buildJsonTree` comes from lib.js (loaded before this).
(function () {
  function looksLikeJsonDocument() {
    const ct = (document.contentType || "").toLowerCase();
    if (ct.includes("json")) return true;
    // Servers that mislabel JSON as text/plain: a body that is a single <pre>.
    const body = document.body;
    if (!body) return false;
    const kids = body.children;
    return kids.length === 1 && kids[0].tagName === "PRE";
  }

  function rawText() {
    const pre = document.body && document.body.querySelector("pre");
    return (pre ? pre.textContent : document.body.textContent) || "";
  }

  function render(parsed) {
    document.documentElement.classList.add("jsonpeek-active");
    document.body.innerHTML =
      '<div id="jp-toolbar">' +
      '<strong>jsonpeek</strong>' +
      '<input id="jp-search" placeholder="filtrar…" />' +
      '<button id="jp-expand">expandir</button>' +
      '<button id="jp-collapse">colapsar</button>' +
      '<button id="jp-copy">copiar</button>' +
      '<button id="jp-raw">raw</button>' +
      "</div>" +
      '<div id="jp-tree">' +
      buildJsonTree(parsed) +
      "</div>";

    const tree = document.getElementById("jp-tree");
    const setOpen = (open) => tree.querySelectorAll("details").forEach((d) => (d.open = open));
    document.getElementById("jp-expand").onclick = () => setOpen(true);
    document.getElementById("jp-collapse").onclick = () => setOpen(false);
    document.getElementById("jp-copy").onclick = () =>
      navigator.clipboard.writeText(JSON.stringify(parsed, null, 2));

    let raw = false;
    document.getElementById("jp-raw").onclick = (e) => {
      raw = !raw;
      if (raw) {
        tree.innerHTML = "<pre id='jp-rawpre'></pre>";
        tree.querySelector("#jp-rawpre").textContent = JSON.stringify(parsed, null, 2);
        e.target.textContent = "árvore";
      } else {
        tree.innerHTML = buildJsonTree(parsed);
        e.target.textContent = "raw";
      }
    };

    const search = document.getElementById("jp-search");
    search.oninput = () => {
      const q = search.value.toLowerCase();
      tree.querySelectorAll(".jp-row, .jp-node").forEach((el) => {
        const hit = !q || el.textContent.toLowerCase().includes(q);
        el.style.display = hit ? "" : "none";
      });
    };
  }

  if (!looksLikeJsonDocument()) return;
  try {
    const parsed = JSON.parse(rawText());
    render(parsed);
  } catch {
    /* not valid JSON — leave the page untouched */
  }
})();
