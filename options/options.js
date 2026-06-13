import { getState, setState, normalizePattern, PRESETS } from "../shared.js";

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
};

let patterns = [];

function renderPatterns() {
  els.patterns.innerHTML = "";
  if (patterns.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Список пуст — добавьте домен выше";
    els.patterns.appendChild(empty);
    return;
  }
  for (const pattern of patterns) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = pattern;
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.textContent = "×";
    remove.title = "Удалить";
    remove.addEventListener("click", () => {
      patterns = patterns.filter((p) => p !== pattern);
      renderPatterns();
    });
    li.append(span, remove);
    els.patterns.appendChild(li);
  }
}

function addPattern() {
  const pattern = normalizePattern(els.newPattern.value);
  if (!pattern) return;
  if (!patterns.includes(pattern)) {
    patterns.push(pattern);
  }
  els.newPattern.value = "";
  renderPatterns();
}

function applyPreset(domains) {
  for (const domain of domains) {
    const pattern = normalizePattern(domain);
    if (pattern && !patterns.includes(pattern)) {
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

async function load() {
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
  const port = parseInt(els.port.value, 10);
  await setState({
    enabled: els.enabled.checked,
    proxy: {
      scheme: els.scheme.value,
      host: els.host.value.trim() || "127.0.0.1",
      port: Number.isInteger(port) ? port : 8080,
    },
    patterns,
  });
  els.savedMsg.textContent = "Сохранено ✓";
  setTimeout(() => (els.savedMsg.textContent = ""), 2000);
}

els.addPattern.addEventListener("click", addPattern);
els.newPattern.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addPattern();
});
els.save.addEventListener("click", save);

load();
