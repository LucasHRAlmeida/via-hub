
(function () {
  var BRIDGE = "https://iniciativa-via.com/via-hub/ponte/via-bridge.json";
  var nodes = document.querySelectorAll("[data-via-episode]");
  if (!nodes.length) return;
  var style = document.createElement("style");
  style.textContent = ".via-bridge{margin:18px 0 22px;padding:16px 18px;border:1px solid rgba(12,62,103,.22);border-radius:16px;background:#fffcf7;color:#122331;font-family:system-ui,sans-serif}.via-bridge p{margin:0 0 8px;font-size:14px;line-height:1.5}.via-bridge .k{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#19a6c9}.via-bridge a{display:inline-flex;min-height:40px;align-items:center;font-weight:700;color:#0c3e67}";
  document.head.appendChild(style);
  fetch(BRIDGE, { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      nodes.forEach(function (el) {
        var series = (data.series || []).find(function (s) { return s.slug === el.getAttribute("data-series"); });
        var ep = series && (series.episodes || []).find(function (e) { return e.id === el.getAttribute("data-via-episode"); });
        var roteiro = "https://iniciativa-via.com/via-hub/ponte/" + (el.getAttribute("data-series") || "") + "/" + (el.getAttribute("data-via-episode") || "") + "/";
        var k = document.createElement("p");
        k.className = "k";
        k.textContent = "Aula correspondente";
        var p = document.createElement("p");
        p.textContent = "O vídeo traduz este bloco. O módulo opera a prática, o rastreio e o limite.";
        var a = document.createElement("a");
        if (ep && ep.youtubeId) {
          a.href = "https://www.youtube.com/watch?v=" + ep.youtubeId;
          a.textContent = "Assistir no YouTube";
        } else {
          a.href = roteiro;
          a.textContent = "Abrir roteiro da aula";
        }
        el.replaceChildren(k, p, a);
      });
    })
    .catch(function () {});
})();
