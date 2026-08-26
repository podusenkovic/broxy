import {
  getState,
  onStateChanged,
  buildPacScript,
  isUsableProxy,
} from "./shared.js";

const BADGE_ON_COLOR = "#1f9d55";

async function applyProxy() {
  const config = await getState();
  const isActive = Boolean(
    config.enabled && config.patterns.length > 0 && isUsableProxy(config.proxy)
  );

  try {
    if (isActive) {
      await chrome.proxy.settings.set({
        scope: "regular",
        value: {
          mode: "pac_script",
          pacScript: { data: buildPacScript(config) },
        },
      });
    } else {
      await chrome.proxy.settings.clear({ scope: "regular" });
    }
  } catch (error) {
    console.error("Broxy: failed to apply proxy settings", error);
    try {
      await chrome.proxy.settings.clear({ scope: "regular" });
    } catch {
      // Ignore a second failure so the worker stays alive.
    }
  }

  updateBadge(isActive, config.patterns.length);
}

function updateBadge(isActive, count) {
  if (isActive) {
    chrome.action.setBadgeBackgroundColor({ color: BADGE_ON_COLOR });
    chrome.action.setBadgeText({ text: String(count) });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

chrome.runtime.onInstalled.addListener(() => applyProxy());
chrome.runtime.onStartup.addListener(() => applyProxy());
onStateChanged(() => applyProxy());

applyProxy();
