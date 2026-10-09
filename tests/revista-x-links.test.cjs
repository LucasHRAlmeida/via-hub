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
const channelOnlyPages = ["bem-estar-multissensorial/index.html"];

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

for (const relativePath of channelOnlyPages) {
  const html = fs.readFileSync(path.join(root, relativePath), "utf8");
  const instagram = html.indexOf(">Instagram ↗</a>");
  const x = html.indexOf('href="https://x.com/drlucashr"');
  const medium = html.indexOf('href="https://medium.com/@drlucashr"');
  assert.ok(instagram >= 0 && instagram < x && x < medium, `${relativePath} deve exibir X entre Instagram e Medium`);
}

const corpus = JSON.parse(fs.readFileSync(path.join(root, "data", "faq.json"), "utf8"));
const answer = corpus.faqs.find((item) => item.id === "a-via-tem-newsletter").answer;
assert.ok(answer.includes("Instagram (@drlucashr), X (@drlucashr), Medium (@drlucashr)"));
const seed = fs.readFileSync(path.join(root, "data", "faq.seed.sql"), "utf8");
assert.ok(seed.includes(answer), "seed deve refletir a resposta canônica");
const sharedGraph = JSON.parse(fs.readFileSync(path.join(root, "data", "graph-nodes.json"), "utf8"));
for (const node of sharedGraph.filter((item) => Array.isArray(item.sameAs))) {
  assert.ok(node.sameAs.includes("https://x.com/drlucashr"), "identidade do FAQ deve declarar X em sameAs");
}
const faqHtml = fs.readFileSync(path.join(root, "faq", "index.html"), "utf8");
assert.match(faqHtml, /Instagram \(@drlucashr\), X \(@drlucashr\), Medium \(@drlucashr\)/, "FAQ deve citar o canal oficial no X");

const revistaHtml = fs.readFileSync(path.join(root, "revista", "index.html"), "utf8");
assert.match(revistaHtml, /href="\.\.\/">← Voltar ao hub<\/a>/, "revista deve ter elo de volta ao hub no topo");
assert.match(revistaHtml, /<a class="wordmark" href="\.\.\/" aria-label="VIA HUB">VI<span>A<\/span> HUB<\/a>/, "wordmark da revista deve apontar para o hub");
assert.doesNotMatch(revistaHtml, /https:\/\/x\.com\/drlucashr/, "revista não deve listar o canal X");
const specialEdition = fs.readFileSync(path.join(root, "revista", "especial-2026-10-04.html"), "utf8");
assert.match(specialEdition, /href="https:\/\/whatsapp\.com\/channel\/0029Vb4Ped05q08h0Uc7PY3v"[^>]*>Canal VIA no WhatsApp/, "edição especial deve encaminhar ao canal oficial");
assert.match(specialEdition, /Dr Lucas HR Almeida — Iniciativa VIA · <a href="https:\/\/iniciativa-via\.com\/via-hub\/revista\/especial-2026-10-04\.html">/, "edição especial deve exibir atribuição e URL canônica");

const revistaReadme = fs.readFileSync(path.join(root, "revista", "README.md"), "utf8");
assert.match(revistaReadme, /Toda edição corrente deve expor no topo um elo de volta ao hub \(`href="\.\.\/"`\); a revista não mantém fileira de canais no rodapé\./, "README da revista deve registrar a invariante editorial");

console.log(JSON.stringify({
  status: "REVISTA_X_LINKS_OK",
  paginas_com_x: channelPages.length,
  faq: true,
  revista_topo: true
}, null, 2));
