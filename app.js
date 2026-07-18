const fallbackData = {
  meta: {
    updated: "2026-07-18"
  },
  projects: [
    {
      id: "ensino-gamificado",
      name: "Vias de Sinalização Oncológica",
      kicker: "Oncologia molecular · ensino",
      categories: ["medicina", "educacao"],
      status: "estável",
      statusKey: "stable",
      featured: true,
      description: "Plataforma interativa sobre os 14 Hallmarks do câncer, vias de sinalização, genes-chave e terapias-alvo, com quiz e relatório de desempenho.",
      tags: ["14 hallmarks", "quiz comentado", "JSON/CSV", "relatório em PDF"],
      url: "https://lucashralmeida.github.io/ensino-gamificado/",
      repo: "https://github.com/LucasHRAlmeida/ensino-gamificado"
    },
    {
      id: "mentoria-ia-osce-fmrp",
      name: "Mentoria IA Literacy — OSCE",
      kicker: "Educação médica · simulação",
      categories: ["medicina", "educacao"],
      status: "beta",
      statusKey: "beta",
      featured: false,
      description: "Simulador de estações clínicas com checklists estruturados e painel de progresso. O protótipo demonstra a interface educacional; não alega avaliação por IA em produção.",
      tags: ["OSCE", "checklists", "dashboard", "feedback local"],
      url: "https://lucashralmeida.github.io/mentoria-ia-osce-fmrp/",
      repo: "https://github.com/LucasHRAlmeida/mentoria-ia-osce-fmrp"
    },
    {
      id: "sarampo-alertas-2026",
      name: "Saúde na Última Semana",
      kicker: "Saúde pública · comunicação",
      categories: ["saude-publica"],
      status: "publicado",
      statusKey: "stable",
      featured: false,
      description: "Boletim web que traduz temas de prevenção e vigilância para o público geral, com os alertas de sarampo de 2026 como caso de comunicação de risco.",
      tags: ["vigilância", "prevenção", "vacinação", "comunicação de risco"],
      url: "https://lucashralmeida.github.io/sarampo-alertas-2026/",
      repo: "https://github.com/LucasHRAlmeida/sarampo-alertas-2026"
    },
    {
      id: "via-mente-mbrp",
      name: "VIA MENTE — MBRP-8",
      kicker: "Saúde mental · prevenção de recaída",
      categories: ["medicina", "educacao"],
      status: "beta",
      statusKey: "beta",
      featured: false,
      description: "Roteiro psicoeducacional interativo de 8 semanas baseado em Mindfulness-Based Relapse Prevention, com práticas diárias, ferramentas de campo e registro local de progresso.",
      tags: ["MBRP", "mindfulness", "56 dias", "localStorage"],
      url: "https://lucashralmeida.github.io/via-hub/via-mente-mbrp/",
      repo: "https://github.com/LucasHRAlmeida/via-hub/tree/main/via-mente-mbrp"
    },
    {
      id: "via-literacia-programacao-github",
      name: "VIA Literacia — Programação, Git e GitHub",
      kicker: "Literacia digital · aprendizagem prática",
      categories: ["educacao", "sistemas"],
      status: "publicado",
      statusKey: "stable",
      featured: false,
      description: "Trilha introdutória em Python que conecta conceitos de programação a um projeto versionado com Git, publicado em branch e integrado por pull request.",
      tags: ["Python", "Git e GitHub", "4–6 horas", "progresso local"],
      url: "https://lucashralmeida.github.io/via-hub/via-literacia-programacao-github/",
      repo: "https://github.com/LucasHRAlmeida/via-hub/tree/main/via-literacia-programacao-github"
    },
    {
      id: "bem-estar-multissensorial",
      name: "Bem-Estar Multissensorial",
      kicker: "Bem-estar · autocuidado",
      categories: ["saude-publica"],
      status: "publicado",
      statusKey: "stable",
      featured: false,
      description: "Guia interativo que combina música, cores e aromas para seis estados de espírito, com referências comentadas e modo de uso. Intervenções inócuas de bem-estar; não substitui orientação profissional.",
      tags: ["cromoterapia", "aromaterapia", "playlists", "6 estados"],
      url: "https://lucashralmeida.github.io/via-hub/bem-estar-multissensorial/",
      repo: "https://github.com/LucasHRAlmeida/via-hub/tree/main/bem-estar-multissensorial"
    },
    {
      id: "regulacao-inteligente",
      name: "Regulação Inteligente do Cuidado",
      kicker: "Sistemas de saúde · governança",
      categories: ["saude-publica", "sistemas"],
      status: "protótipo reservado",
      statusKey: "reserved",
      featured: false,
      description: "Prova de conceito para organizar decisões complexas de regulação por recurso, contexto clínico e interoperabilidade. Conteúdo técnico mantido em desenvolvimento reservado.",
      tags: ["SUS", "regulação", "interoperabilidade", "apoio à decisão"],
      url: null,
      repo: null
    }
  ]
};

const state = {
  projects: [],
  filter: "all"
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
  if (project.url) actions.append(buildLink("Abrir demonstração", project.url));
  if (project.repo) actions.append(buildLink("Ver código", project.repo));
  if (!project.url && !project.repo) {
    const lock = document.createElement("span");
    lock.className = "project-lock";
    lock.textContent = "Acesso sob conversa institucional";
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
    state.projects = data.projects;
  } catch (error) {
    console.warn("projects.json indisponível; usando conteúdo incorporado.", error);
    state.projects = fallbackData.projects;
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

loadProjects();
