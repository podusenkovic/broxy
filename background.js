import { getState, onStateChanged, buildPacScript } from "./shared.js";

const BADGE_ON_COLOR = "#1f9d55";

async function applyProxy(state) {
  const config = state || (await getState());
  const isActive = config.enabled && config.patterns.length > 0;

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
onStateChanged((newValue) => applyProxy(newValue));

applyProxy();
