const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "assets", "theme.js"), "utf8");
const attributes = new Map();
const listeners = new Map();
const storageListeners = [];
const stored = new Map();

const button = {
  dataset: {},
  setAttribute(name, value) { attributes.set(name, String(value)); },
  removeAttribute(name) { attributes.delete(name); },
  addEventListener(type, handler) { listeners.set(type, handler); },
  textContent: "",
  title: ""
};

const meta = {
  content: null,
  setAttribute(name, value) {
    if (name === "content") this.content = value;
  }
};

let mountedButton = null;
const root = { dataset: {}, style: {} };
const localStorage = {
  getItem(key) { return stored.has(key) ? stored.get(key) : null; },
  setItem(key, value) { stored.set(key, String(value)); },
  removeItem(key) { stored.delete(key); }
};
const media = {
  matches: true,
  addEventListener() {}
};

const document = {
  documentElement: root,
  readyState: "complete",
  body: {
    appendChild(node) { mountedButton = node; }
  },
  createElement(tag) {
    assert.equal(tag, "button");
    return button;
  },
  querySelector(selector) {
    if (selector === 'meta[name="theme-color"]') return meta;
    if (selector === "[data-via-theme-toggle]") return mountedButton;
    return null;
  }
};

const window = {
  matchMedia(query) {
    assert.equal(query, "(prefers-color-scheme: dark)");
    return media;
  },
  addEventListener(type, handler) {
    if (type === "storage") storageListeners.push(handler);
  }
};

vm.runInNewContext(source, {
  document,
  window,
  localStorage,
  Object
}, { filename: "assets/theme.js" });

assert.equal(root.dataset.theme, "dark");
assert.equal(root.style.colorScheme, "dark");
assert.equal(meta.content, "#081A2B");
assert.equal(attributes.get("aria-label"), "Usar tema claro");
assert.equal(button.title, "Usar tema claro");
assert.equal(button.textContent, "☀︎");
assert.equal(attributes.has("aria-pressed"), false, "rótulo de ação não pode coexistir com estado aria-pressed");

listeners.get("click")();
assert.equal(root.dataset.theme, "light");
assert.equal(stored.get("via-theme"), "light");
assert.equal(attributes.get("aria-label"), "Usar tema escuro");
assert.equal(attributes.has("aria-pressed"), false);

storageListeners[0]({ storageArea: localStorage, key: "via-theme", newValue: "dark" });
assert.equal(root.dataset.theme, "dark");
assert.equal(attributes.get("aria-label"), "Usar tema claro");
assert.equal(attributes.has("aria-pressed"), false);

window.VIATheme.reset();
assert.equal(stored.has("via-theme"), false);
assert.equal(root.dataset.theme, "dark");
assert.equal(attributes.has("aria-pressed"), false);

console.log(JSON.stringify({
  status: "THEME_TOGGLE_A11Y_OK",
  action_label: attributes.get("aria-label"),
  aria_pressed_present: attributes.has("aria-pressed"),
  synchronized_theme: root.dataset.theme
}, null, 2));
