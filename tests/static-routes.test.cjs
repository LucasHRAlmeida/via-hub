const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const htmlFiles = [];
const canonicalOrigin = "https://iniciativa-via.com";
const canonicalBasePath = "/via-hub";

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}

walk(root);

const resolveRoute = (source, href) => {
  const cleanHref = href.split("#")[0].split("?")[0];
  if (!cleanHref || cleanHref.includes("${")) return null;

  let localHref = cleanHref;
  if (/^[a-z]+:/i.test(cleanHref)) {
    const url = new URL(cleanHref);
    if (url.origin !== canonicalOrigin) return null;
    if (url.pathname === canonicalBasePath) localHref = "/";
    else if (url.pathname.startsWith(`${canonicalBasePath}/`)) localHref = url.pathname.slice(canonicalBasePath.length);
    else return null;
  } else if (cleanHref.startsWith("//")) {
    return null;
  } else if (cleanHref.startsWith("/")) {
    if (cleanHref === canonicalBasePath) localHref = "/";
    else if (cleanHref.startsWith(`${canonicalBasePath}/`)) localHref = cleanHref.slice(canonicalBasePath.length);
    else return null;
  }

  const candidate = localHref.startsWith("/")
    ? path.join(root, localHref.slice(1))
    : path.resolve(path.dirname(source), localHref);
  if (localHref.endsWith("/")) return path.join(candidate, "index.html");
  if (path.extname(candidate)) return candidate;
  return path.join(candidate, "index.html");
};

for (const source of htmlFiles) {
  const html = fs.readFileSync(source, "utf8");
  for (const [, href] of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const target = resolveRoute(source, href);
    if (target) assert.ok(fs.existsSync(target), `${path.relative(root, source)} aponta para rota ausente: ${href}`);
  }
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const target = resolveRoute(root, url);
  assert.ok(target, `sitemap usa URL fora do escopo do checkout: ${url}`);
  assert.ok(fs.existsSync(target), `sitemap aponta para rota ausente: ${url}`);
}

console.log(`STATIC_ROUTES_OK: ${htmlFiles.length} HTML files`);
