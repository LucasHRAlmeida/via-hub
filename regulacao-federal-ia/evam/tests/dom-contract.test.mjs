import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("HTML expõe todos os pontos de montagem usados pelo aplicativo", async () => {
  const [html, app] = await Promise.all([
    readFile(new URL("index.html", root), "utf8"),
    readFile(new URL("app.js", root), "utf8"),
  ]);
  const selectors = [...app.matchAll(/\$\("#([a-z0-9-]+)"\)/g)].map((match) => match[1]);
  assert.ok(selectors.length > 10);
  for (const id of selectors) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `elemento #${id} deve existir no HTML`);
  }
});

test("artefato permanece local e sem dependências remotas", async () => {
  const files = await Promise.all([
    "index.html",
    "app.js",
    "parser.js",
    "schemas.js",
  ].map((name) => readFile(new URL(name, root), "utf8")));
  const source = files.join("\n");
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(source, /<script[^>]+src=["']https?:\/\//i);
});

test("HTML declara escopo clínico e privacidade de forma visível", async () => {
  const html = await readFile(new URL("index.html", root), "utf8");
  assert.match(html, /não deve receber dados clínicos reais identificáveis/i);
  assert.match(html, /não diagnostica, não prioriza e não escolhe destino/i);
  assert.match(html, /validação humana obrigatória/i);
});

