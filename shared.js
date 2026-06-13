const STORAGE_KEY = "broxy";

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

export async function getState() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY] || {};
  return {
    ...DEFAULT_STATE,
    ...value,
    proxy: { ...DEFAULT_STATE.proxy, ...(value.proxy || {}) },
    patterns: Array.isArray(value.patterns) ? value.patterns : [],
  };
}

export async function setState(partial) {
  const current = await getState();
  const next = { ...current, ...partial };
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

export function onStateChanged(callback) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue);
    }
  });
}

export function normalizePattern(raw) {
  const value = (raw || "").trim();
  if (!value) return "";
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export function buildProxyToken(proxy) {
  const keyword = PROXY_SCHEMES[proxy.scheme] || "PROXY";
  return `${keyword} ${proxy.host}:${proxy.port}`;
}

export function buildPacScript(state) {
  const proxyToken = buildProxyToken(state.proxy);
  const patterns = JSON.stringify(state.patterns);
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
