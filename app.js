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
  if (project.seriesUrl) actions.append(buildLink("Abrir série", project.seriesUrl));
  if (project.url) actions.append(buildLink(project.featuredPilot ? "Abrir módulo" : "Abrir demonstração", project.url));
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

loadProjects();
