/**
 * Busca e filtro do FAQ canônico da Iniciativa VIA.
 *
 * Roda inteiramente no navegador, sobre o conteúdo já presente no HTML: não há
 * requisição de rede, não há corpus paralelo e nada do que o usuário digita sai
 * do dispositivo — a mesma invariante declarada nas respostas desta página.
 *
 * O realce de termos é montado por nós de texto e elementos <mark> criados via
 * DOM; nenhuma string derivada de entrada do usuário chega a innerHTML.
 */

const form = document.querySelector("[data-search]");
const input = document.querySelector("[data-input]");
const filterBar = document.querySelector("[data-filters]");
const statusEl = document.querySelector("[data-status]");
const emptyEl = document.querySelector("[data-empty]");

const groups = Array.from(document.querySelectorAll(".faq-group"));
const state = { query: "", filter: "all" };

/**
 * Dobra o texto para comparação (minúsculas, sem acentos) preservando o
 * mapeamento para os índices originais: `map[i]` é a posição, no texto de
 * origem, do i-ésimo caractere dobrado. Sem esse mapa, um caractere que dobre
 * para mais de um — ou para nenhum — deslocaria o realce.
 */
function fold(text) {
  let folded = "";
  const map = [];
  for (let i = 0; i < text.length; i += 1) {
    const chunk = text[i]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    for (const char of chunk) {
      folded += char;
      map.push(i);
    }
  }
  map.push(text.length);
  return { folded, map };
}

const entries = Array.from(document.querySelectorAll(".faq-item")).map((el) => {
  const questionEl = el.querySelector("[data-question]");
  const answerEl = el.querySelector("[data-answer]");
  const question = questionEl.textContent;
  const answer = answerEl.textContent;
  const group = el.closest(".faq-group");
  const label = group?.querySelector(".faq-group-title")?.textContent ?? "";
  return {
    el,
    questionEl,
    answerEl,
    question,
    answer,
    haystack: fold(`${question} ${answer} ${label} ${el.dataset.category}`).folded,
  };
});

/** Intervalos de correspondência, no espaço do texto original, já mesclados. */
function matchRanges(text, terms) {
  const { folded, map } = fold(text);
  const ranges = [];
  for (const term of terms) {
    let at = folded.indexOf(term);
    while (at !== -1) {
      ranges.push([map[at], map[at + term.length]]);
      at = folded.indexOf(term, at + term.length);
    }
  }
  if (ranges.length === 0) return ranges;

  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (const [start, end] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

function renderHighlighted(node, text, terms) {
  const ranges = terms.length === 0 ? [] : matchRanges(text, terms);
  if (ranges.length === 0) {
    node.replaceChildren(document.createTextNode(text));
    return;
  }

  const parts = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push(document.createTextNode(text.slice(cursor, start)));
    const mark = document.createElement("mark");
    mark.textContent = text.slice(start, end);
    parts.push(mark);
    cursor = end;
  }
  if (cursor < text.length) parts.push(document.createTextNode(text.slice(cursor)));
  node.replaceChildren(...parts);
}

function describe(visible, total) {
  const hasQuery = state.query.trim().length > 0;
  const hasFilter = state.filter !== "all";
  if (!hasQuery && !hasFilter) return `${total} perguntas.`;

  const noun = visible === 1 ? "pergunta" : "perguntas";
  if (visible === 0) return "Nenhuma pergunta encontrada.";
  return `${visible} ${noun} de ${total}.`;
}

function apply() {
  const terms = fold(state.query.trim()).folded.split(/\s+/).filter(Boolean);
  let visible = 0;

  for (const entry of entries) {
    const inFilter = state.filter === "all" || entry.el.dataset.category === state.filter;
    const inQuery = terms.every((term) => entry.haystack.includes(term));
    const show = inFilter && inQuery;

    entry.el.hidden = !show;
    if (show) {
      visible += 1;
      renderHighlighted(entry.questionEl, entry.question, terms);
      renderHighlighted(entry.answerEl, entry.answer, terms);
    }
  }

  for (const group of groups) {
    group.hidden = !group.querySelector(".faq-item:not([hidden])");
  }

  if (emptyEl) emptyEl.hidden = visible > 0;
  if (statusEl) statusEl.textContent = describe(visible, entries.length);
}

function reset() {
  state.query = "";
  if (input) input.value = "";
  apply();
}

let pending = 0;
input?.addEventListener("input", () => {
  window.clearTimeout(pending);
  pending = window.setTimeout(() => {
    state.query = input.value;
    apply();
  }, 120);
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  window.clearTimeout(pending);
  state.query = input?.value ?? "";
  apply();
});

for (const button of document.querySelectorAll("[data-clear]")) {
  button.addEventListener("click", () => {
    reset();
    input?.focus();
  });
}

filterBar?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  for (const candidate of filterBar.querySelectorAll("[data-filter]")) {
    const active = candidate === button;
    candidate.classList.toggle("is-active", active);
    candidate.setAttribute("aria-pressed", String(active));
  }
  apply();
});

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing =
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    input?.focus();
    input?.select();
    return;
  }

  if (event.key === "Escape" && target === input) {
    reset();
  }
});

// Cabeçalho fixo: mesmo comportamento das demais páginas do hub.
const header = document.querySelector("[data-header]");
function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}
window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

apply();
