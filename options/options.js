import {
  getState,
  setState,
  normalizePattern,
  PRESETS,
  applyI18n,
  t,
  isValidHost,
  isValidPort,
} from "../shared.js";

const els = {
  scheme: document.getElementById("scheme"),
  host: document.getElementById("host"),
  port: document.getElementById("port"),
  enabled: document.getElementById("enabled"),
  newPattern: document.getElementById("newPattern"),
  addPattern: document.getElementById("addPattern"),
  presets: document.getElementById("presets"),
  patterns: document.getElementById("patterns"),
  save: document.getElementById("save"),
  savedMsg: document.getElementById("savedMsg"),
  formError: document.getElementById("formError"),
};

let patterns = [];

function showError(message) {
  els.formError.textContent = message || "";
}

function renderPatterns() {
  els.patterns.innerHTML = "";
  if (patterns.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = t("listEmpty");
    els.patterns.appendChild(empty);
    return;
  }
  for (const pattern of patterns) {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = pattern;
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = t("remove");
    remove.addEventListener("click", () => {
      patterns = patterns.filter((value) => value !== pattern);
      renderPatterns();
    });
    item.append(label, remove);
    els.patterns.appendChild(item);
  }
}

function addPattern() {
  const pattern = normalizePattern(els.newPattern.value);
  if (!isValidHost(pattern)) {
    showError(t("errorPattern"));
    return;
  }
  showError("");
  if (!patterns.includes(pattern)) {
    patterns.push(pattern);
  }
  els.newPattern.value = "";
  renderPatterns();
}

function applyPreset(domains) {
  for (const domain of domains) {
    const pattern = normalizePattern(domain);
    if (isValidHost(pattern) && !patterns.includes(pattern)) {
      patterns.push(pattern);
    }
  }
  renderPatterns();
}

function renderPresets() {
  for (const [name, domains] of Object.entries(PRESETS)) {
    const button = document.createElement("button");
    button.className = "preset";
    button.type = "button";
    button.textContent = `+ ${name}`;
    button.title = domains.join(", ");
    button.addEventListener("click", () => applyPreset(domains));
    els.presets.appendChild(button);
  }
}

function readFormError() {
  if (!isValidHost(els.host.value)) return t("errorHost");
  if (!isValidPort(els.port.value)) return t("errorPort");
  return "";
}

async function load() {
  applyI18n();
  document.title = t("optionsTitle");
  const state = await getState();
  els.scheme.value = state.proxy.scheme;
  els.host.value = state.proxy.host;
  els.port.value = state.proxy.port;
  els.enabled.checked = state.enabled;
  patterns = [...state.patterns];
  renderPresets();
  renderPatterns();
}

async function save() {
  const error = readFormError();
  if (error) {
    showError(error);
    return;
  }
  showError("");
  await setState({
    enabled: els.enabled.checked,
    proxy: {
      scheme: els.scheme.value,
      host: els.host.value.trim(),
      port: Number(els.port.value),
    },
    patterns,
  });
  els.savedMsg.textContent = t("saved");
  setTimeout(() => {
    els.savedMsg.textContent = "";
  }, 2000);
}

els.addPattern.addEventListener("click", addPattern);
els.newPattern.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addPattern();
});
els.save.addEventListener("click", save);

load();
