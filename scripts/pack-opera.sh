#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$root/manifest.json")"
out_dir="$root/dist"
out="$out_dir/broxy-opera-${version}.zip"

mkdir -p "$out_dir"
rm -f "$out"

# Opera rejects a ZIP whose first folder is the project root.
# manifest.json must sit at the archive root. Do not pack README, store, or git files.
cd "$root"
zip -X -q "$out" \
  manifest.json \
  background.js \
  shared.js \
  icons/icon16.png \
  icons/icon48.png \
  icons/icon128.png \
  popup/popup.html \
  popup/popup.css \
  popup/popup.js \
  options/options.html \
  options/options.css \
  options/options.js \
  _locales/en/messages.json \
  _locales/ru/messages.json

python3 - "$out" <<'PY'
import json, sys, zipfile
from pathlib import Path

out = Path(sys.argv[1])
with zipfile.ZipFile(out) as archive:
    names = archive.namelist()
    if "manifest.json" not in names:
        raise SystemExit("manifest.json must be at the ZIP root")
    forbidden = [
        name
        for name in names
        if name.startswith((".git", "store/", "scripts/", "dist/"))
        or name in {"README.md", ".gitignore"}
    ]
    if forbidden:
        raise SystemExit(f"unused files in package: {forbidden}")
    json.loads(archive.read("manifest.json"))
    print(f"packed {len(names)} files -> {out}")
    print("\n".join(sorted(names)))
PY

echo "Upload this file at https://addons.opera.com/developer/"
echo "$out"
