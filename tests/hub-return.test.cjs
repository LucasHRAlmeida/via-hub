const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const hubUrl = "https://iniciativa-via.com/via-hub/";
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html") && full !== path.join(root, "index.html")) files.push(full);
  }
}
walk(root);

function resolvesToHub(source, href) {
  if (href === hubUrl || href === "/via-hub/") return true;
  if (/^(?:https?:|\/\/|#)/i.test(href) || href.startsWith("/")) return false;
  const dest = path.resolve(path.dirname(source), href.split(/[?#]/)[0]);
  return dest === root || dest === path.join(root, "index.html");
}

for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  assert.ok(body, "Corpo HTML ausente: " + path.relative(root, file));
  const beginning = body[1].slice(0, 5000);
  const links = [...beginning.matchAll(/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi)];
  const hasHubLink = links.some(([, before, href, after, inner]) => {
    const visible = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const aria = (before + after).match(/aria-label=["']([^"']+)["']/i)?.[1] || "";
    return resolvesToHub(file, href) && /(?:\bhub\b|voltar ao portal|iniciativa via|explorar o hub)/i.test(visible + " " + aria);
  });
  assert.ok(hasHubLink, "Sem retorno explícito ao Hub no início: " + path.relative(root, file));
}
assert.ok(files.length >= 35, "Inventário de superfícies inesperadamente reduzido");
console.log("VIA_HUB_RETURN_OK:", files.length, "superfícies HTML");
