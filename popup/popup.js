import { getState, setState, normalizePattern, applyI18n, t } from "../shared.js";

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
  if (active) {
    els.statusText.textContent = t("statusOn", [String(state.patterns.length)]);
  } else if (state.enabled) {
    els.statusText.textContent = t("statusOnEmpty");
  } else {
    els.statusText.textContent = t("statusOff");
  }

  els.proxyLine.textContent = `${state.proxy.scheme.toUpperCase()} → ${state.proxy.host}:${state.proxy.port}`;
  renderSite(state);
}

function renderSite(state) {
  if (!currentHost) {
    els.siteHost.textContent = t("noActiveSite");
    els.siteToggle.disabled = true;
    els.siteToggle.textContent = "—";
    els.siteToggle.classList.remove("active");
    return;
  }

  const pattern = normalizePattern(currentHost);
  const inList = state.patterns.includes(pattern);
  els.siteHost.textContent = currentHost;
  els.siteToggle.disabled = false;
  els.siteToggle.textContent = inList ? t("removeSite") : t("proxySite");
  els.siteToggle.classList.toggle("active", inList);
}

async function init() {
  applyI18n();
  currentHost = await getActiveHost();
  render(await getState());
}

els.enabled.addEventListener("change", async () => {
  render(await setState({ enabled: els.enabled.checked }));
});

els.siteToggle.addEventListener("click", async () => {
  const pattern = normalizePattern(currentHost);
  if (!pattern) return;
  const state = await getState();
  const exists = state.patterns.includes(pattern);
  const patterns = exists
    ? state.patterns.filter((item) => item !== pattern)
    : [...state.patterns, pattern];
  render(await setState({ patterns }));
});

els.openOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

init();
