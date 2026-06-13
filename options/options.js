import { getState, setState, normalizePattern } from "../shared.js";

const els = {
  scheme: document.getElementById("scheme"),
  host: document.getElementById("host"),
  port: document.getElementById("port"),
  enabled: document.getElementById("enabled"),
  newPattern: document.getElementById("newPattern"),
  addPattern: document.getElementById("addPattern"),
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

async function load() {
  const state = await getState();
  els.scheme.value = state.proxy.scheme;
  els.host.value = state.proxy.host;
  els.port.value = state.proxy.port;
  els.enabled.checked = state.enabled;
  patterns = [...state.patterns];
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
