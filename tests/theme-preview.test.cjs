const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const privateFixturePath = path.join(root, "qa", "theme-preview", "index.html");
const cssPath = path.join(root, "assets", "theme.css");
const jsPath = path.join(root, "assets", "theme.js");

assert.equal(
  fs.existsSync(privateFixturePath),
  false,
  "a prévia privada não pode permanecer na árvore publicada pelo GitHub Pages"
);
assert.equal(fs.existsSync(cssPath), true, "assets/theme.css deve existir");
assert.equal(fs.existsSync(jsPath), true, "assets/theme.js deve existir");

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(target);
    return entry.isFile() && entry.name.endsWith(".html") ? [target] : [];
  });
}

const consumers = htmlFiles(root).filter((file) => {
  const html = fs.readFileSync(file, "utf8");
  return /assets\/theme\.(?:css|js)/.test(html);
});

assert.deepEqual(
  consumers.map((file) => path.relative(root, file)),
  [],
  "nenhuma página pública pode consumir os assets antes de deliberação específica"
);

console.log(JSON.stringify({
  status: "PRIVATE_THEME_PREVIEW_BOUNDARY_OK",
  committed_fixture: false,
  shared_assets_exist: true,
  public_consumers: []
}, null, 2));
