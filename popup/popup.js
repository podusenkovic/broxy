import { getState, setState, normalizePattern } from "../shared.js";

const els = {
  enabled: document.getElementById("enabled"),
  statusDot: document.getElementById("statusDot"),
  statusText: document.getElementById("statusText"),
  proxyLine: document.getElementById("proxyLine"),
  siteHost: document.getElementById("siteHost"),
  siteToggle: document.getElementById("siteToggle"),
  openOptions: document.getElementById("openOptions"),
};

let currentHost = "";

async function getActiveHost() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return "";
  try {
    const url = new URL(tab.url);
    if (!/^https?:$/.test(url.protocol)) return "";
    return url.hostname;
  } catch {
    return "";
  }
}

function render(state) {
  els.enabled.checked = state.enabled;

  const active = state.enabled && state.patterns.length > 0;
  els.statusDot.classList.toggle("on", active);
  els.statusText.textContent = active
    ? `Прокси активен · сайтов: ${state.patterns.length}`
    : state.enabled
      ? "Включён, но список сайтов пуст"
      : "Прокси выключен";

  els.proxyLine.textContent = `${state.proxy.scheme.toUpperCase()} → ${state.proxy.host}:${state.proxy.port}`;

  renderSite(state);
}

function renderSite(state) {
  if (!currentHost) {
    els.siteHost.textContent = "Нет активного сайта";
    els.siteToggle.disabled = true;
    els.siteToggle.textContent = "—";
    els.siteToggle.classList.remove("active");
    return;
  }

  const pattern = normalizePattern(currentHost);
  const inList = state.patterns.includes(pattern);
  els.siteHost.textContent = currentHost;
  els.siteToggle.disabled = false;
  els.siteToggle.textContent = inList ? "Убрать из прокси" : "Проксировать сайт";
  els.siteToggle.classList.toggle("active", inList);
}

async function init() {
  currentHost = await getActiveHost();
  const state = await getState();
  render(state);
}

els.enabled.addEventListener("change", async () => {
  const state = await setState({ enabled: els.enabled.checked });
  render(state);
});

els.siteToggle.addEventListener("click", async () => {
  const pattern = normalizePattern(currentHost);
  if (!pattern) return;
  const state = await getState();
  const exists = state.patterns.includes(pattern);
  const patterns = exists
    ? state.patterns.filter((p) => p !== pattern)
    : [...state.patterns, pattern];
  const next = await setState({ patterns });
  render(next);
});

els.openOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

init();
