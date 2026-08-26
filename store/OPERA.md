# Opera Add-ons: copy-paste kit

Upload ZIP: `dist/broxy-opera-1.0.1.zip`  
Form: https://addons.opera.com/developer/ → **+ Upload new add-on**

Official rules: [Publishing guidelines](https://help.opera.com/en/extensions/publishing-guidelines/), [Acceptance criteria](https://help.opera.com/en/extensions/acceptance-criteria/), [Icons](https://help.opera.com/en/extensions/effective-icons/).

## Page 1 — package

Upload `dist/broxy-opera-1.0.1.zip`.  
`manifest.json` is at the ZIP root. Do not zip the project folder itself.

## Page 2 — details

| Field | Value |
|---|---|
| Name | Broxy — Local Proxy Switcher |
| Version | 1.0.1 (from the ZIP) |
| Category | **Web Development** |
| Support webpage | https://github.com/podusenkovic/broxy |
| Privacy policy | https://github.com/podusenkovic/broxy/blob/master/store/privacy-policy.md |
| License | **Opera hosting license** (you keep the rights). Alternative: Apache 2.0 |

## Page 3 — summary (required)

Broxy routes only the websites you choose through your local HTTP, HTTPS, or SOCKS proxy, and leaves all other traffic on a direct connection.

## Page 3 — description (required)

Broxy is a local proxy switcher. It does not include a proxy server. You point it at a proxy you already run, such as `127.0.0.1:8080`.

The toolbar popup is a compact dark panel. It shows an on/off switch, the current proxy address, and a button that adds or removes the site in the active tab. A green badge on the icon shows how many sites are in the list when the proxy is on.

The settings page lets you choose HTTP, HTTPS, SOCKS5, or SOCKS4, set host and port, and edit the domain list. One-click presets add related domains for YouTube, Google, X, Instagram, Reddit, and Netflix.

Background action: when the switch is on and the list is not empty, Broxy applies a PAC script through the browser proxy API. Listed domains go to your proxy; everything else uses DIRECT. Turning Broxy off clears those settings. Disable the built-in Opera VPN while Broxy is active so the two do not conflict.

Settings stay in this browser. Broxy does not collect personal data and does not send traffic to a remote server.

How to use it:

1. Click the Broxy icon, then open Settings and site list.
2. Enter your local proxy host and port, then Save.
3. Add domains or use a preset, then Save.
4. Turn the popup switch on. Only listed sites use the proxy.

## Page 4 — platforms

Mark the platforms you actually tested. The extension uses standard Chromium APIs and should work on Windows, macOS, and Linux. Reviewers will test all three.

## Page 5 — images

- Icon for the form (**64×64**, required): `store/icon64.png`
- Toolbar icons 16/48/128 stay inside the ZIP; do not upload those here
- Screenshots (612×408, non-interlaced PNG):
  - `store/screenshots/01-popup.png` — popup and toolbar
  - `store/screenshots/02-options.png` — settings page

## Reviewer notes

- Broxy needs a running local proxy to fetch listed sites. If no proxy is running, those sites fail to load — that is expected.
- With the switch off, Broxy calls `chrome.proxy.settings.clear` and does not change routing.
- Permissions: `proxy` (PAC), `storage` (settings), `activeTab` (current hostname in the popup).
- Code is not minified or obfuscated. There are no remote scripts.

## After you push this repo

Privacy URL above works only after `store/privacy-policy.md` is on GitHub. Until then, paste the same text into any public page and use that URL.
