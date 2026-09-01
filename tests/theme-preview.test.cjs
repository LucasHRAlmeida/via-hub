const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const fixturePath = path.join(__dirname, "..", "qa", "theme-preview", "index.html");
const html = fs.readFileSync(fixturePath, "utf8");

assert.match(html, /<meta name="robots" content="noindex,nofollow,noarchive">/);
assert.match(html, /href="\.\.\/\.\.\/assets\/theme\.css"/);
assert.match(html, /src="\.\.\/\.\.\/assets\/theme\.js"/);
assert.match(html, /window\.VIATheme\.reset\(\)/);
assert.match(html, /Nenhuma página real do VIA-Hub é alterada/);
assert.doesNotMatch(html, /https?:\/\//, "fixture isolada não deve depender de recursos externos");

console.log(JSON.stringify({
  status: "THEME_PREVIEW_FIXTURE_OK",
  noindex: true,
  shared_assets: true,
  external_dependencies: false
}, null, 2));
