const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const channelPages = [
  "index.html",
  "sobre/index.html",
  "mentoria-sincronismo-hibrido/index.html",
  "regulacao-federal-ia/index.html",
  "soberania-informacional/index.html",
  "via-mente-mbrp/index.html",
  "via-economia-saude/index.html",
  "via-literacia-programacao-github/index.html"
];

for (const relativePath of channelPages) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  assert.match(
    html,
    /https:\/\/www\.instagram\.com\/drlucashr",\s*\n\s*"https:\/\/x\.com\/drlucashr",\s*\n\s*"https:\/\/medium\.com\/@drlucashr"/,
    `${relativePath} deve listar X no sameAs logo após Instagram`
  );
  assert.match(
    html,
    /Instagram ↗<\/a>\s*\n\s*<a href="https:\/\/x\.com\/drlucashr"[^>]*>X · @drlucashr ↗<\/a>\s*\n\s*<a href="https:\/\/medium\.com\/@drlucashr"/,
    `${relativePath} deve exibir a pílula de X entre Instagram e Medium`
  );
}

const faqHtml = fs.readFileSync(path.join(root, "faq", "index.html"), "utf8");
assert.match(faqHtml, /Instagram \(@drlucashr\), X \(@drlucashr\), Medium \(@drlucashr\)/, "FAQ deve citar o canal oficial no X");

const revistaHtml = fs.readFileSync(path.join(root, "revista", "index.html"), "utf8");
assert.match(revistaHtml, /href="\.\.\/">← Voltar ao hub<\/a>/, "revista deve ter elo de volta ao hub no topo");
assert.match(revistaHtml, /<a class="wordmark" href="\.\.\/" aria-label="VIA HUB">VI<span>A<\/span> HUB<\/a>/, "wordmark da revista deve apontar para o hub");
assert.doesNotMatch(revistaHtml, /https:\/\/x\.com\/drlucashr/, "revista não deve listar o canal X");

const revistaReadme = fs.readFileSync(path.join(root, "revista", "README.md"), "utf8");
assert.match(revistaReadme, /Toda edição corrente deve expor no topo um elo de volta ao hub \(`href="\.\.\/"`\); a revista não mantém fileira de canais no rodapé\./, "README da revista deve registrar a invariante editorial");

console.log(JSON.stringify({
  status: "REVISTA_X_LINKS_OK",
  paginas_com_x: channelPages.length,
  faq: true,
  revista_topo: true
}, null, 2));
