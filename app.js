const state = {
  projects: [],
  filter: "all",
  lang: "pt"
};

const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const filterBar = document.querySelector("[data-filters]");
const projectGrid = document.querySelector("[data-project-grid]");

function setHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
}

function setMenu(open) {
  if (!menuToggle || !nav) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

function buildLink(label, href, className = "project-link") {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(" ", arrow);
  return link;
}

function createProjectCard(project, index) {
  const card = document.createElement("article");
  card.className = `project-card${project.featured ? " is-featured" : ""}`;
  card.dataset.categories = project.categories.join(" ");

  const top = document.createElement("div");
  top.className = "project-top";

  const number = document.createElement("span");
  number.className = "project-num";
  number.textContent = String(index + 1).padStart(2, "0");

  const status = document.createElement("span");
  status.className = "status-badge";
  if (project.statusKey === "beta") status.classList.add("is-beta");
  if (project.statusKey === "reserved") status.classList.add("is-reserved");
  status.textContent = project.status;
  top.append(number, status);

  const kicker = document.createElement("p");
  kicker.className = "project-kicker";
  kicker.textContent = project.kicker;

  const title = document.createElement("h3");
  title.textContent = project.name;

  const description = document.createElement("p");
  description.className = "project-description";
  description.textContent = project.description;

  const tags = document.createElement("ul");
  tags.className = "project-meta";
  for (const tag of project.tags) {
    const item = document.createElement("li");
    item.textContent = tag;
    tags.append(item);
  }

  const actions = document.createElement("div");
  actions.className = "project-actions";
  const t = I18N[state.lang] || I18N.pt;
  if (project.seriesUrl) actions.append(buildLink(t["card.serie"], project.seriesUrl));
  if (project.url) actions.append(buildLink(project.featuredPilot ? t["card.modulo"] : t["card.demo"], project.url));
  if (project.repo) actions.append(buildLink(t["card.codigo"], project.repo));
  if (!project.url && !project.repo) {
    const lock = document.createElement("span");
    lock.className = "project-lock";
    lock.textContent = t["card.lock"];
    actions.append(lock);
  }

  card.append(top, kicker, title, description, tags, actions);
  return card;
}

function applyFilter() {
  const cards = projectGrid?.querySelectorAll(".project-card") ?? [];
  for (const card of cards) {
    const categories = card.dataset.categories.split(" ");
    card.hidden = state.filter !== "all" && !categories.includes(state.filter);
  }
}

function renderProjects(projects) {
  if (!projectGrid) return;
  projectGrid.replaceChildren(...projects.map(createProjectCard));
  applyFilter();

  const publicCount = projects.filter((project) => Boolean(project.url)).length;
  const counter = document.querySelector("[data-project-count]");
  if (counter) counter.textContent = String(publicCount);
}

async function loadProjects() {
  try {
    const response = await fetch("projects.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.projects)) throw new Error("Formato inválido");
    state.projects = data.projects.slice().sort((a,b) => Number(!!b.featuredPilot) - Number(!!a.featuredPilot));
  } catch (error) {
    console.warn("projects.json indisponível; catálogo vazio.", error);
    state.projects = [];
  }
  renderProjects(state.projects);
}

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  setMenu(open);
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

filterBar?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  for (const candidate of filterBar.querySelectorAll("[data-filter]")) {
    const active = candidate === button;
    candidate.classList.toggle("is-active", active);
    candidate.setAttribute("aria-pressed", String(active));
  }
  applyFilter();
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

/* ------------------------------------------------------------------
   i18n — home only. Default is always pt-BR. Selector is opt-in.
   ------------------------------------------------------------------ */
const I18N = {
  pt: {
    "skip": "Ir para o conteúdo",
    "brand.sub": "Vida Integrada e Autônoma",
    "nav.tese": "Tese",
    "nav.metodo": "Método",
    "nav.frentes": "Frentes",
    "nav.piloto": "Piloto",
    "nav.portfolio": "Portfólio",
    "nav.parcerias": "Parcerias",
    "nav.sobre": "Sobre o fundador",
    "nav.faq": "FAQ",
    "cta": "Propor parceria",
    "menu": "Abrir navegação",
    "eyebrow": "Iniciativa médico-científica independente",
    "hero.h1": "Da evidência à interface.<br><em>Do problema real à ferramenta.</em>",
    "hero.lede": "A Iniciativa VIA conecta medicina, pesquisa e tecnologia para transformar conhecimento validado em educação, apoio à decisão e soluções de saúde pública — com escopo explícito, rastreabilidade e supervisão humana.",
    "btn.piloto": "Abrir o piloto",
    "btn.metodo": "Conhecer o método",
    "fact.1": "séries-piloto",
    "fact.2": "frentes conectadas",
    "fact.3": "critério: utilidade verificável",
    "sys.head": "VIA / sistema de trabalho",
    "sys.live": "em construção",
    "sys.foot.a": "Conhecimento",
    "sys.foot.b": "Estrutura",
    "sys.foot.c": "Decisão",
    "node.a": "Evidência",
    "node.b": "Clínica",
    "node.c": "Dados",
    "node.d": "Interface",
    "kicker.tese": "01 · A tese",
    "tese.h2": "O gargalo raramente é apenas falta de informação.",
    "tese.lead": "É a distância entre a informação e a decisão: conteúdo sem estrutura, sistemas que não conversam e interfaces que escondem seus próprios limites.",
    "tese.p2": "A VIA nasce para trabalhar nessa distância. O ponto de partida não é \u201cusar IA\u201d, mas definir com precisão o problema clínico, educacional ou sistêmico; só então escolher a tecnologia compatível com o risco e com o contexto de uso.",
    "callout.span": "Princípio operacional",
    "callout.strong": "Autonomia com responsabilidade: tecnologia a serviço do cuidado, com validação, transparência e supervisão humana.",
    "kicker.metodo": "02 · Método VIA",
    "metodo.h2": "A tecnologia entra depois da pergunta certa.",
    "metodo.p": "O processo separa fonte, modelo, interface e validação. Misturá-los produz demos vistosas e sistemas frágeis.",
    "m1.t": "Problema e contexto",
    "m1.p": "Quem decide, sob qual pressão e com qual consequência?",
    "m2.t": "Conhecimento versionado",
    "m2.p": "Fontes, regras, incertezas e limites de validade.",
    "m3.t": "Representação estruturada",
    "m3.p": "Dados e critérios transformados em componentes auditáveis.",
    "m4.t": "Interface ou modelo",
    "m4.p": "A tecnologia mínima suficiente para o trabalho real.",
    "m5.t": "Validação e implantação",
    "m5.p": "Teste, registro de erro, governança e escala proporcional ao risco.",
    "mn1.span": "Separação crítica",
    "mn1.h": "A fonte não é a ferramenta.",
    "mn1.p": "O conhecimento permanece reaproveitável e atualizável; cada interface declara qual versão utiliza.",
    "mn2.span": "Critério clínico",
    "mn2.h": "Erro útil é erro rastreável.",
    "mn2.p": "O objetivo não é esconder falhas, mas torná-las legíveis o bastante para orientar calibração e governança.",
    "mn3.span": "Critério técnico",
    "mn3.h": "Complexidade precisa pagar aluguel.",
    "mn3.p": "Uma camada nova só entra quando reduz risco, trabalho ou ambiguidade de forma demonstrável.",
    "kicker.frentes": "03 · Frentes de atuação",
    "frentes.h2": "Uma estrutura única. Cinco portas de entrada.",
    "frentes.p": "A taxonomia preserva as diferenças entre cuidado, ciência e engenharia sem romper as conexões entre elas.",
    "f1.label": "Atuação-fim",
    "f1.h": "Medicina e educação clínica",
    "f1.p": "Casos, simulações, raciocínio clínico e ferramentas que traduzem conteúdo denso em aprendizagem e decisão.",
    "f1.li1": "Educação médica",
    "f1.li2": "Oncologia molecular",
    "f1.li3": "Raciocínio clínico e OSCE",
    "f2.label": "Escala populacional",
    "f2.h": "Saúde pública",
    "f2.p": "Vigilância, prevenção e comunicação de risco voltadas a comunidades e sistemas de saúde.",
    "f3.label": "Habilidade transversal",
    "f3.h": "Tecnologia, dados e direitos",
    "f3.p": "Aplicativos web, IA aplicada e governança que tornam o conhecimento operacional sem desproteger a autonomia do usuário.",
    "f4.label": "Fonte",
    "f4.h": "Produção de conhecimento",
    "f4.p": "Referências, sínteses e materiais didáticos versionados antes de abastecer qualquer ferramenta.",
    "f5.label": "Passagem, não morada",
    "f5.h": "Laboratório",
    "card.serie": "Abrir série",
    "card.modulo": "Abrir módulo",
    "card.demo": "Abrir demonstração",
    "card.codigo": "Ver código",
    "card.lock": "Acesso sob conversa institucional"
  },
  en: {
    "skip": "Skip to content",
    "brand.sub": "Integrated and Autonomous Life",
    "nav.tese": "Thesis",
    "nav.metodo": "Method",
    "nav.frentes": "Fronts",
    "nav.piloto": "Pilot",
    "nav.portfolio": "Portfolio",
    "nav.parcerias": "Partnerships",
    "nav.sobre": "About the founder",
    "nav.faq": "FAQ",
    "cta": "Propose partnership",
    "menu": "Open navigation",
    "eyebrow": "Independent medical-scientific initiative",
    "hero.h1": "From evidence to interface.<br><em>From the real problem to the tool.</em>",
    "hero.lede": "The VIA Initiative connects medicine, research and technology to turn validated knowledge into education, decision support and public-health solutions — with explicit scope, traceability and human oversight.",
    "btn.piloto": "Open the pilot",
    "btn.metodo": "Learn the method",
    "fact.1": "pilot series",
    "fact.2": "connected fronts",
    "fact.3": "criterion: verifiable utility",
    "sys.head": "VIA / working system",
    "sys.live": "under construction",
    "sys.foot.a": "Knowledge",
    "sys.foot.b": "Structure",
    "sys.foot.c": "Decision",
    "node.a": "Evidence",
    "node.b": "Clinical",
    "node.c": "Data",
    "node.d": "Interface",
    "kicker.tese": "01 · The thesis",
    "tese.h2": "The bottleneck is rarely just a lack of information.",
    "tese.lead": "It is the distance between information and decision: content without structure, systems that do not talk to each other, and interfaces that hide their own limits.",
    "tese.p2": "VIA exists to work in that distance. The starting point is not \u201cusing AI\u201d, but precisely defining the clinical, educational or systemic problem; only then choosing the technology compatible with the risk and the context of use.",
    "callout.span": "Operating principle",
    "callout.strong": "Autonomy with responsibility: technology in service of care, with validation, transparency and human oversight.",
    "kicker.metodo": "02 · VIA Method",
    "metodo.h2": "Technology comes after the right question.",
    "metodo.p": "The process separates source, model, interface and validation. Mixing them produces flashy demos and fragile systems.",
    "m1.t": "Problem and context",
    "m1.p": "Who decides, under what pressure and with what consequence?",
    "m2.t": "Versioned knowledge",
    "m2.p": "Sources, rules, uncertainties and limits of validity.",
    "m3.t": "Structured representation",
    "m3.p": "Data and criteria turned into auditable components.",
    "m4.t": "Interface or model",
    "m4.p": "The minimum technology sufficient for the real work.",
    "m5.t": "Validation and deployment",
    "m5.p": "Testing, error logging, governance and scale proportional to risk.",
    "mn1.span": "Critical separation",
    "mn1.h": "The source is not the tool.",
    "mn1.p": "Knowledge stays reusable and updatable; each interface declares which version it uses.",
    "mn2.span": "Clinical criterion",
    "mn2.h": "Useful error is traceable error.",
    "mn2.p": "The goal is not to hide failures, but to make them legible enough to guide calibration and governance.",
    "mn3.span": "Technical criterion",
    "mn3.h": "Complexity must pay rent.",
    "mn3.p": "A new layer enters only when it demonstrably reduces risk, work or ambiguity.",
    "kicker.frentes": "03 · Areas of work",
    "frentes.h2": "One structure. Five doors in.",
    "frentes.p": "The taxonomy preserves the differences between care, science and engineering without breaking the connections between them.",
    "f1.label": "End-use",
    "f1.h": "Medicine and clinical education",
    "f1.p": "Cases, simulations, clinical reasoning and tools that turn dense content into learning and decision.",
    "f1.li1": "Medical education",
    "f1.li2": "Molecular oncology",
    "f1.li3": "Clinical reasoning and OSCE",
    "f2.label": "Population scale",
    "f2.h": "Public health",
    "f2.p": "Surveillance, prevention and risk communication aimed at communities and health systems.",
    "f3.label": "Cross-cutting skill",
    "f3.h": "Technology, data and rights",
    "f3.p": "Web apps, applied AI and governance that make knowledge operational without undermining user autonomy.",
    "f4.label": "Source",
    "f4.h": "Knowledge production",
    "f4.p": "References, syntheses and versioned teaching materials before feeding any tool.",
    "f5.label": "Passage, not dwelling",
    "f5.h": "Laboratory",
    "card.serie": "Open series",
    "card.modulo": "Open module",
    "card.demo": "Open demo",
    "card.codigo": "View code",
    "card.lock": "Access by institutional conversation"
  }
};

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el && value != null) el.textContent = value;
}

function setHtml(selector, value) {
  const el = document.querySelector(selector);
  if (el && value != null) el.innerHTML = value;
}

function applyLang(lang) {
  const t = I18N[lang] || I18N.pt;
  state.lang = lang === "en" ? "en" : "pt";
  document.documentElement.lang = state.lang === "en" ? "en" : "pt-BR";

  setText(".skip-link", t.skip);
  setText(".brand-copy small", t["brand.sub"]);
  setText('.site-nav a[href="#tese"]', t["nav.tese"]);
  setText('.site-nav a[href="#metodo"]', t["nav.metodo"]);
  setText('.site-nav a[href="#frentes"]', t["nav.frentes"]);
  setText('.site-nav a[href="#piloto"]', t["nav.piloto"]);
  setText('.site-nav a[href="#portfolio"]', t["nav.portfolio"]);
  setText('.site-nav a[href="#parcerias"]', t["nav.parcerias"]);
  setText('.site-nav a[href="sobre/"]', t["nav.sobre"]);
  setText('.site-nav a[href="faq/"]', t["nav.faq"]);

  const cta = document.querySelector(".header-cta");
  if (cta) {
    const arrow = cta.querySelector("[aria-hidden]");
    cta.childNodes[0].textContent = t.cta + (arrow ? "\n        " : "");
    if (!arrow) cta.textContent = t.cta;
    else {
      cta.innerHTML = `${t.cta}\n        <span aria-hidden="true">↗</span>`;
    }
  }

  const menuLabel = document.querySelector(".menu-toggle .sr-only");
  if (menuLabel) menuLabel.textContent = t.menu;

  const eyebrow = document.querySelector(".eyebrow");
  if (eyebrow) {
    const bar = eyebrow.querySelector("span");
    eyebrow.textContent = "";
    if (bar) eyebrow.append(bar, document.createTextNode(" " + t.eyebrow));
    else eyebrow.textContent = t.eyebrow;
  }

  setHtml(".hero h1", t["hero.h1"]);
  setText(".hero-lede", t["hero.lede"]);

  const primary = document.querySelector(".hero-actions .button-primary");
  if (primary) primary.innerHTML = `${t["btn.piloto"]} <span aria-hidden="true">↓</span>`;
  setText(".hero-actions .button-secondary", t["btn.metodo"]);

  const facts = document.querySelectorAll(".hero-facts dd");
  if (facts[0]) facts[0].textContent = t["fact.1"];
  if (facts[1]) facts[1].textContent = t["fact.2"];
  if (facts[2]) facts[2].textContent = t["fact.3"];

  const sysHead = document.querySelector(".system-head span:first-child");
  if (sysHead) sysHead.textContent = t["sys.head"];
  const live = document.querySelector(".system-live");
  if (live) {
    const dot = live.querySelector("i");
    live.textContent = "";
    if (dot) live.append(dot, document.createTextNode(" " + t["sys.live"]));
    else live.textContent = t["sys.live"];
  }
  const foot = document.querySelectorAll(".system-foot span");
  if (foot[0]) foot[0].textContent = t["sys.foot.a"];
  if (foot[1]) foot[1].textContent = t["sys.foot.b"];
  if (foot[2]) foot[2].textContent = t["sys.foot.c"];
  setText(".node-a", t["node.a"]);
  setText(".node-b", t["node.b"]);
  setText(".node-c", t["node.c"]);
  setText(".node-d", t["node.d"]);

  setText("#tese .section-kicker", t["kicker.tese"]);
  setText("#tese h2", t["tese.h2"]);
  setText("#tese .lead", t["tese.lead"]);
  const tesePs = document.querySelectorAll("#tese .thesis-copy > p");
  if (tesePs[1]) tesePs[1].textContent = t["tese.p2"];
  setText("#tese .principle-callout span", t["callout.span"]);
  setText("#tese .principle-callout strong", t["callout.strong"]);

  setText("#metodo .section-kicker", t["kicker.metodo"]);
  setText("#metodo .method-heading h2", t["metodo.h2"]);
  setText("#metodo .method-heading + p, #metodo .section-heading > p", t["metodo.p"]);
  const steps = document.querySelectorAll("#metodo .method-flow li");
  const stepKeys = ["m1", "m2", "m3", "m4", "m5"];
  steps.forEach((li, i) => {
    const key = stepKeys[i];
    if (!key) return;
    const strong = li.querySelector("strong");
    const p = li.querySelector("p");
    if (strong) strong.textContent = t[`${key}.t`];
    if (p) p.textContent = t[`${key}.p`];
  });
  const notes = document.querySelectorAll("#metodo .method-notes article");
  const noteKeys = ["mn1", "mn2", "mn3"];
  notes.forEach((art, i) => {
    const key = noteKeys[i];
    if (!key) return;
    const span = art.querySelector("span");
    const h = art.querySelector("h3");
    const p = art.querySelector("p");
    if (span) span.textContent = t[`${key}.span`];
    if (h) h.textContent = t[`${key}.h`];
    if (p) p.textContent = t[`${key}.p`];
  });

  setText("#frentes .section-kicker", t["kicker.frentes"]);
  setText("#frentes .section-heading h2", t["frentes.h2"]);
  setText("#frentes .section-heading > p", t["frentes.p"]);
  const cards = document.querySelectorAll("#frentes .front-card");
  const frontMap = [
    ["f1.label", "f1.h", "f1.p", ["f1.li1", "f1.li2", "f1.li3"]],
    ["f2.label", "f2.h", "f2.p", []],
    ["f3.label", "f3.h", "f3.p", []],
    ["f4.label", "f4.h", "f4.p", []],
    ["f5.label", "f5.h", null, []]
  ];
  cards.forEach((card, i) => {
    const map = frontMap[i];
    if (!map) return;
    const label = card.querySelector(".front-label");
    const h = card.querySelector("h3");
    const p = card.querySelector("p:not(.front-label)");
    if (label) label.textContent = t[map[0]];
    if (h) h.textContent = t[map[1]];
    if (p && map[2]) p.textContent = t[map[2]];
    const lis = card.querySelectorAll("li");
    map[3].forEach((k, j) => { if (lis[j]) lis[j].textContent = t[k]; });
  });

  document.querySelectorAll("[data-lang-toggle] button").forEach((btn) => {
    const on = btn.dataset.lang === state.lang;
    btn.setAttribute("aria-pressed", String(on));
    btn.classList.toggle("is-active", on);
  });

  if (state.projects.length) renderProjects(state.projects);
}

function injectLangToggle() {
  if (document.querySelector("[data-lang-toggle]")) return;
  const inner = document.querySelector(".header-inner");
  if (!inner) return;

  if (!document.getElementById("via-lang-style")) {
    const style = document.createElement("style");
    style.id = "via-lang-style";
    style.textContent = `
      .lang-toggle{display:inline-flex;align-items:center;gap:2px;margin-left:8px;padding:3px;border:1px solid currentColor;border-radius:999px;opacity:.72}
      .lang-toggle button{appearance:none;border:0;background:transparent;color:inherit;font:inherit;font-size:var(--t-micro);font-weight:750;letter-spacing:.08em;padding:6px 8px;border-radius:999px;cursor:pointer}
      .lang-toggle button.is-active{background:currentColor;color:var(--navy-950)}
      .site-header.is-scrolled .lang-toggle button.is-active{color:var(--paper);background:var(--navy-900)}
      @media (max-width: 980px){.lang-toggle{margin-left:auto;margin-right:8px}}
    `;
    document.head.appendChild(style);
  }

  const wrap = document.createElement("div");
  wrap.className = "lang-toggle";
  wrap.setAttribute("data-lang-toggle", "");
  wrap.setAttribute("role", "group");
  wrap.setAttribute("aria-label", "Language");
  wrap.innerHTML = `<button type="button" data-lang="pt" aria-pressed="true">PT</button><button type="button" data-lang="en" aria-pressed="false">EN</button>`;
  const cta = inner.querySelector(".header-cta");
  if (cta) inner.insertBefore(wrap, cta);
  else inner.append(wrap);

  wrap.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-lang]");
    if (!btn) return;
    const next = btn.dataset.lang === "en" ? "en" : "pt";
    try { localStorage.setItem("via-lang", next); } catch (_) {}
    applyLang(next);
  });
}

injectLangToggle();
{
  let initial = "pt";
  try {
    const stored = localStorage.getItem("via-lang");
    if (stored === "en") initial = "en";
  } catch (_) {}
  if (initial === "en") applyLang("en");
}

loadProjects();

