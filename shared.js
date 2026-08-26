const STORAGE_KEY = "broxy";
const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
const HOSTNAME_RE =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/i;

export const PROXY_SCHEMES = {
  http: "PROXY",
  https: "HTTPS",
  socks5: "SOCKS5",
  socks4: "SOCKS",
};

export const DEFAULT_STATE = {
  enabled: false,
  proxy: {
    scheme: "http",
    host: "127.0.0.1",
    port: 8080,
  },
  patterns: [],
};

export const PRESETS = {
  YouTube: [
    "youtube.com",
    "youtu.be",
    "ytimg.com",
    "ggpht.com",
    "googlevideo.com",
    "googleapis.com",
    "gstatic.com",
  ],
  Google: ["google.com", "googleapis.com", "gstatic.com", "googleusercontent.com"],
  "Twitter / X": ["x.com", "twitter.com", "twimg.com", "t.co"],
  Instagram: ["instagram.com", "cdninstagram.com", "fbcdn.net"],
  Reddit: ["reddit.com", "redd.it", "redditstatic.com", "redditmedia.com"],
  Netflix: ["netflix.com", "nflxvideo.net", "nflximg.net", "nflxext.com"],
};

export function t(key, substitutions) {
  if (typeof chrome !== "undefined" && chrome.i18n?.getMessage) {
    const value = chrome.i18n.getMessage(key, substitutions);
    if (value) return value;
  }
  return key;
}

export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.getAttribute("data-i18n-title")));
  });
}

export function isValidHost(host) {
  const value = (host || "").trim();
  if (!value || value.length > 253) return false;
  if (value === "localhost") return true;
  if (IPV4_RE.test(value)) return true;
  return HOSTNAME_RE.test(value);
}

export function isValidPort(port) {
  const value = Number(port);
  return Number.isInteger(value) && value >= 1 && value <= 65535;
}

export function isUsableProxy(proxy) {
  return Boolean(
    proxy &&
      PROXY_SCHEMES[proxy.scheme] &&
      isValidHost(proxy.host) &&
      isValidPort(proxy.port)
  );
}

export function normalizePattern(raw) {
  const value = (raw || "").trim();
  if (!value) return "";
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^\*\./, "")
    .toLowerCase();
}

export function sanitizePatterns(patterns) {
  if (!Array.isArray(patterns)) return [];
  const seen = new Set();
  const result = [];
  for (const raw of patterns) {
    const pattern = normalizePattern(raw);
    if (!pattern || seen.has(pattern) || !isValidHost(pattern)) continue;
    seen.add(pattern);
    result.push(pattern);
  }
  return result;
}

export async function getState() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY] || {};
  return {
    ...DEFAULT_STATE,
    ...value,
    proxy: { ...DEFAULT_STATE.proxy, ...(value.proxy || {}) },
    patterns: sanitizePatterns(value.patterns),
  };
}

export async function setState(partial) {
  const current = await getState();
  const next = { ...current, ...partial };
  if (partial.proxy) {
    next.proxy = { ...current.proxy, ...partial.proxy };
  }
  if (Array.isArray(partial.patterns)) {
    next.patterns = sanitizePatterns(partial.patterns);
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

export function onStateChanged(callback) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORAGE_KEY]) {
      callback();
    }
  });
}

export function buildProxyToken(proxy) {
  const keyword = PROXY_SCHEMES[proxy.scheme] || "PROXY";
  return `${keyword} ${proxy.host}:${proxy.port}`;
}

export function buildPacScript(state) {
  const proxyToken = buildProxyToken(state.proxy);
  const patterns = JSON.stringify(sanitizePatterns(state.patterns));
  return `function FindProxyForURL(url, host) {
  var proxy = ${JSON.stringify(proxyToken)};
  var patterns = ${patterns};
  for (var i = 0; i < patterns.length; i++) {
    var p = patterns[i];
    if (!p) continue;
    if (host === p || shExpMatch(host, "*." + p) || shExpMatch(host, p)) {
      return proxy;
    }
  }
  return "DIRECT";
}`;
}
