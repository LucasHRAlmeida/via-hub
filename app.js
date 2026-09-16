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
  const loc = (state.lang === "en" && project.en) ? project.en : project;
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
  status.textContent = loc.status ?? project.status;
  top.append(number, status);

  const kicker = document.createElement("p");
  kicker.className = "project-kicker";
  kicker.textContent = loc.kicker ?? project.kicker;

  const title = document.createElement("h3");
  title.textContent = loc.name ?? project.name;

  const description = document.createElement("p");
  description.className = "project-description";
  description.textContent = loc.description ?? project.description;

  const tags = document.createElement("ul");
  tags.className = "project-meta";
  for (const tag of (loc.tags ?? project.tags)) {
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
    "kicker.piloto": "04 · Piloto de distribuição",
    "piloto.h2": "Dois módulos maduros viram série.",
    "piloto.p": "MBRP-8 e Economia & Saúde já têm fonte, interface e limite. O que faltava era a voz com packaging consistente e o link de volta.",
    "piloto.c1.label": "VIA MENTE",
    "piloto.c1.h": "MBRP-8",
    "piloto.c1.p": "Oito semanas. O vídeo traduz a semana; o módulo opera a prática.",
    "piloto.c1.a": "Série e roteiros →",
    "piloto.c2.label": "VIA ECONOMIA",
    "piloto.c2.h": "Economia & Saúde",
    "piloto.c2.p": "Caixa, equilíbrio, reserva. O número serve à decisão; não mercantiliza o cuidado.",
    "piloto.c2.a": "Série e roteiros →",
    "piloto.c3.label": "Contrato",
    "piloto.c3.h": "via-bridge.json",
    "piloto.c3.p": "IDs de YouTube são campo. O atalho /v/slug/ep não quebra.",
    "piloto.c3.a": "Abrir a ponte →",
    "kicker.portfolio": "05 · Portfólio",
    "portfolio.h2": "O restante, agrupado — não por recência.",
    "portfolio.p": "Projetos pequenos por desenho, públicos quando maduros e claros quanto ao que fazem — e ao que ainda não fazem.",
    "portfolio.loading": "Carregando portfólio…",
    "filter.aria": "Filtrar demonstrações",
    "filter.all": "Todos",
    "filter.medicina": "Medicina",
    "filter.educacao": "Educação",
    "filter.saude-publica": "Saúde pública",
    "filter.sistemas": "Sistemas",
    "filter.direitos-digitais": "Direitos digitais",
    "kicker.parcerias": "06 · Parcerias",
    "parcerias.h2": "Problemas difíceis pedem alianças específicas.",
    "parcerias.p": "A VIA busca instituições de saúde, grupos de pesquisa, universidades, gestores e equipes técnicas com um problema real, acesso legítimo ao contexto e disposição para validar — não apenas para “colocar IA” em uma apresentação.",
    "parcerias.cta": "Estruturar uma proposta",
    "parcerias.panel": "O que uma boa conversa inicial traz",
    "parcerias.i1.t": "Um gargalo observável",
    "parcerias.i1.s": "processo, público, frequência e impacto",
    "parcerias.i2.t": "Uma hipótese de valor",
    "parcerias.i2.s": "o que deveria melhorar e como medir",
    "parcerias.i3.t": "Um campo de validação",
    "parcerias.i3.s": "quem testa, supervisiona e pode interromper",
    "parcerias.i4.t": "Fronteiras honestas",
    "parcerias.i4.s": "dados disponíveis, riscos e restrições reais",
    "kicker.fundador": "Fundador e direção clínica",
    "fundador.role": "Médico Generalista · FMRP-USP",
    "fundador.p": "A VIA parte de uma posição deliberadamente híbrida: o problema é lido por dentro da medicina e traduzido até uma forma que pesquisadores, engenheiros, gestores e usuários possam interrogar em conjunto.",
    "fundador.sobre": "Sobre o fundador",
    "fundador.portfolio": "Portfólio público",
    "fundador.alt": "Selo pessoal LA 31 de Dr Lucas HR Almeida",
    "footer.identity": "Dr Lucas HR Almeida — Médico Generalista (FMRP-USP)\nCRM-SP: 226836 | CRM-MG: 109752",
    "footer.whatsapp": "WhatsApp Business: +55 16 99618-0196",
    "footer.initiative": "Iniciativa VIA — Vida Integrada e Autônoma",
    "footer.tagline": "Ciência e Tecnologia a serviço do Cuidado.",
    "footer.code": "Código e versões ↗",
    "footer.copy": "Iniciativa VIA",
    "footer.built": "Construído como parte do próprio portfólio.",
    "cross.role": "Médico Generalista (FMRP-USP) · CRM-SP 226836 | CRM-MG 109752",
    "cross.line": "Iniciativa VIA — Vida Integrada e Autônoma · Ciência e Tecnologia a serviço do Cuidado.",
    "cross.sobre": "Sobre o fundador",
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
    "kicker.piloto": "04 · Distribution pilot",
    "piloto.h2": "Two mature modules become a series.",
    "piloto.p": "MBRP-8 and Economy & Health already have source, interface and limits. What was missing was a consistent voice and packaging — and the link back.",
    "piloto.c1.label": "VIA MENTE",
    "piloto.c1.h": "MBRP-8",
    "piloto.c1.p": "Eight weeks. The video frames the week; the module runs the practice.",
    "piloto.c1.a": "Series and scripts →",
    "piloto.c2.label": "VIA ECONOMIA",
    "piloto.c2.h": "Economy & Health",
    "piloto.c2.p": "Cash flow, break-even, reserve. The number serves the decision; it does not commodify care.",
    "piloto.c2.a": "Series and scripts →",
    "piloto.c3.label": "Contract",
    "piloto.c3.h": "via-bridge.json",
    "piloto.c3.p": "YouTube IDs are a field. The /v/slug/ep shortcut does not break.",
    "piloto.c3.a": "Open the bridge →",
    "kicker.portfolio": "05 · Portfolio",
    "portfolio.h2": "The rest, grouped — not by recency.",
    "portfolio.p": "Small projects by design, public when mature, and clear about what they do — and what they do not yet do.",
    "portfolio.loading": "Loading portfolio…",
    "filter.aria": "Filter demos",
    "filter.all": "All",
    "filter.medicina": "Medicine",
    "filter.educacao": "Education",
    "filter.saude-publica": "Public health",
    "filter.sistemas": "Systems",
    "filter.direitos-digitais": "Digital rights",
    "kicker.parcerias": "06 · Partnerships",
    "parcerias.h2": "Hard problems call for specific alliances.",
    "parcerias.p": "VIA seeks health institutions, research groups, universities, managers and technical teams with a real problem, legitimate access to context and a willingness to validate — not merely to “put AI” into a slide deck.",
    "parcerias.cta": "Structure a proposal",
    "parcerias.panel": "What a good first conversation brings",
    "parcerias.i1.t": "An observable bottleneck",
    "parcerias.i1.s": "process, audience, frequency and impact",
    "parcerias.i2.t": "A value hypothesis",
    "parcerias.i2.s": "what should improve and how to measure it",
    "parcerias.i3.t": "A validation field",
    "parcerias.i3.s": "who tests, supervises and can stop",
    "parcerias.i4.t": "Honest boundaries",
    "parcerias.i4.s": "available data, risks and real constraints",
    "kicker.fundador": "Founder and clinical direction",
    "fundador.role": "General Practitioner · FMRP-USP",
    "fundador.p": "VIA starts from a deliberately hybrid stance: the problem is read from inside medicine and translated into a form that researchers, engineers, managers and users can interrogate together.",
    "fundador.sobre": "About the founder",
    "fundador.portfolio": "Public portfolio",
    "fundador.alt": "Personal seal LA 31 of Dr Lucas HR Almeida",
    "footer.identity": "Dr Lucas HR Almeida — General Practitioner (FMRP-USP)\nCRM-SP: 226836 | CRM-MG: 109752",
    "footer.whatsapp": "WhatsApp Business: +55 16 99618-0196",
    "footer.initiative": "VIA Initiative — Integrated and Autonomous Life",
    "footer.tagline": "Science and Technology in service of Care.",
    "footer.code": "Code and versions ↗",
    "footer.copy": "VIA Initiative",
    "footer.built": "Built as part of the portfolio itself.",
    "cross.role": "General Practitioner (FMRP-USP) · CRM-SP 226836 | CRM-MG 109752",
    "cross.line": "VIA Initiative — Integrated and Autonomous Life · Science and Technology in service of Care.",
    "cross.sobre": "About the founder",
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

  setText("#piloto .section-kicker", t["kicker.piloto"]);
  setText("#piloto .section-heading h2", t["piloto.h2"]);
  setText("#piloto .section-heading > p", t["piloto.p"]);
  const pilotoCards = document.querySelectorAll("#piloto .front-card");
  const pilotoMap = [
    ["piloto.c1.label", "piloto.c1.h", "piloto.c1.p", "piloto.c1.a"],
    ["piloto.c2.label", "piloto.c2.h", "piloto.c2.p", "piloto.c2.a"],
    ["piloto.c3.label", "piloto.c3.h", "piloto.c3.p", "piloto.c3.a"]
  ];
  pilotoCards.forEach((card, i) => {
    const map = pilotoMap[i];
    if (!map) return;
    const label = card.querySelector(".front-label");
    const h = card.querySelector("h3");
    const body = card.querySelector("p:not(.front-label)");
    const a = card.querySelector("a");
    if (label) label.textContent = t[map[0]];
    if (h) h.textContent = t[map[1]];
    if (body) body.textContent = t[map[2]];
    if (a) a.textContent = t[map[3]];
  });

  setText("#portfolio .section-kicker", t["kicker.portfolio"]);
  setText("#portfolio .portfolio-heading h2", t["portfolio.h2"]);
  setText("#portfolio .portfolio-heading > p", t["portfolio.p"]);
  if (filterBar) {
    filterBar.setAttribute("aria-label", t["filter.aria"]);
    for (const btn of filterBar.querySelectorAll("[data-filter]")) {
      const key = `filter.${btn.dataset.filter}`;
      if (t[key]) btn.textContent = t[key];
    }
  }
  const loading = projectGrid?.querySelector(".loading-state");
  if (loading) loading.textContent = t["portfolio.loading"];

  setText("#parcerias .section-kicker", t["kicker.parcerias"]);
  setText("#parcerias .partnership-copy h2", t["parcerias.h2"]);
  setText("#parcerias .partnership-copy > p", t["parcerias.p"]);
  const partnerCta = document.querySelector("#parcerias .partnership-copy a.button");
  if (partnerCta) partnerCta.innerHTML = `${t["parcerias.cta"]} <span aria-hidden="true">↗</span>`;
  setText("#parcerias .panel-title", t["parcerias.panel"]);
  const partnerItems = document.querySelectorAll("#parcerias .partner-panel li");
  ["i1","i2","i3","i4"].forEach((key, i) => {
    const li = partnerItems[i];
    if (!li) return;
    const strong = li.querySelector("strong");
    const small = li.querySelector("small");
    if (strong) strong.textContent = t[`parcerias.${key}.t`];
    if (small) small.textContent = t[`parcerias.${key}.s`];
  });

  setText("#fundador .section-kicker", t["kicker.fundador"]);
  setText("#fundador .founder-role", t["fundador.role"]);
  const fundadorBody = document.querySelector("#fundador .founder-layout > div > p:not(.section-kicker):not(.founder-role)");
  if (fundadorBody) fundadorBody.textContent = t["fundador.p"];
  const fundadorImg = document.querySelector("#fundador .founder-mark img");
  if (fundadorImg) fundadorImg.alt = t["fundador.alt"];
  const fundadorLinks = document.querySelectorAll("#fundador .founder-links a");
  if (fundadorLinks[0]) fundadorLinks[0].innerHTML = `${t["fundador.sobre"]} <span aria-hidden="true">→</span>`;
  if (fundadorLinks[2]) fundadorLinks[2].innerHTML = `${t["fundador.portfolio"]} <span aria-hidden="true">→</span>`;

  document.querySelectorAll(".brand-copy small").forEach((el) => {
    el.textContent = t["brand.sub"];
  });
  const footerPs = document.querySelectorAll(".site-footer .footer-layout > p");
  if (footerPs[0]) {
    footerPs[0].innerHTML = "";
    const idLines = t["footer.identity"].split("\n");
    footerPs[0].append(document.createTextNode(idLines[0]));
    footerPs[0].append(document.createElement("br"));
    footerPs[0].append(document.createTextNode(idLines[1] || ""));
    footerPs[0].append(document.createElement("br"));
    const wa = document.createElement("a");
    wa.href = "https://wa.me/5516996180196";
    wa.target = "_blank";
    wa.rel = "noopener noreferrer";
    wa.textContent = t["footer.whatsapp"];
    footerPs[0].append(wa);
  }
  if (footerPs[1]) {
    footerPs[1].innerHTML = "";
    footerPs[1].append(document.createTextNode(t["footer.initiative"]));
    footerPs[1].append(document.createElement("br"));
    const strong = document.createElement("strong");
    strong.textContent = t["footer.tagline"];
    footerPs[1].append(strong);
  }
  setText(".site-footer .footer-link", t["footer.code"]);
  const footerBase = document.querySelectorAll(".site-footer .footer-base > span");
  if (footerBase[0]) {
    const yearEl = footerBase[0].querySelector("[data-year]");
    const year = yearEl ? yearEl.textContent : String(new Date().getFullYear());
    footerBase[0].textContent = "";
    footerBase[0].append(document.createTextNode("© "));
    const y = document.createElement("span");
    y.setAttribute("data-year", "");
    y.textContent = year;
    footerBase[0].append(y);
    footerBase[0].append(document.createTextNode(" " + t["footer.copy"]));
  }
  if (footerBase[1]) footerBase[1].textContent = t["footer.built"];

  const hubLink = document.querySelector('a[href="https://iniciativa-via.com/via-hub/"]');
  const cross = hubLink?.closest("aside");
  if (cross && hubLink) {
    const linkDiv = hubLink.parentElement;
    const lineDiv = linkDiv?.previousElementSibling;
    const roleDiv = lineDiv?.previousElementSibling;
    if (roleDiv) {
      roleDiv.textContent = "";
      const s = document.createElement("strong");
      s.style.color = "#fff";
      s.textContent = "Dr Lucas HR Almeida";
      roleDiv.append(s, document.createTextNode(" — " + t["cross.role"]));
    }
    if (lineDiv) lineDiv.textContent = t["cross.line"];
    const sobreLink = linkDiv?.querySelector('a[href="https://iniciativa-via.com/via-hub/sobre/"]');
    hubLink.textContent = t["footer.copy"];
    if (sobreLink) sobreLink.textContent = t["cross.sobre"];
  }

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

