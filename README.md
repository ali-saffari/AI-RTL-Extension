# AI RTL

Browser extension that fixes right-to-left (RTL) layout and Persian/Farsi font rendering on AI chat websites such as ChatGPT, Claude, Gemini, DeepSeek, Copilot, Perplexity, Grok, and 50+ other tools.

Homepage: [https://ai-rtl.ir](https://ai-rtl.ir)

## Supported browsers

| Browser | Manifest | Build output | Store |
|---------|----------|--------------|-------|
| Google Chrome / Chromium | `public/manifest.chrome.json` | `dist/` | Chrome Web Store |
| Mozilla Firefox | `public/manifest.firefox.json` | `dist-firefox/` | Firefox Add-ons (AMO) |

Both targets share the same source under `src/` and are built with webpack (Manifest V3).

## Features

- Automatic RTL alignment for Persian and Arabic text
- Persian font injection for supported AI sites
- Per-site enable/disable controls
- Optional Manual RTL mode for other websites
- Popup and options page for settings

## Requirements

- Node.js 18+ (Node.js 20 recommended)
- npm 9+

## Install

```bash
npm install
```

Use the included `package-lock.json` so dependency versions match the release build.

## Build

### Google Chrome

Production build:

```bash
npm run build:chrome
```

Release zip (version bump + zip):

```bash
npm run build:chrome:release
```

Outputs:

- Unpacked extension: `dist/`
- Zip package: `releases/chrome/chrome-extension-vX.Y.Z.zip` (from `build:chrome:release`)

Load unpacked in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select `dist/`.

Webpack config: `webpack.config.chrome.js`  
Manifest source: `public/manifest.chrome.json` (copied to `dist/manifest.json`)

### Mozilla Firefox

Production build + zip:

```bash
npm run build:firefox
```

AMO helper alias:

```bash
npm run build-for-amo
```

Outputs:

- Unpacked extension: `dist-firefox/`
- Zip package: `releases/firefox/firefox-extension-vX.Y.Z.zip`

Load temporary add-on in Firefox: `about:debugging` → This Firefox → Load Temporary Add-on → select `dist-firefox/manifest.json`.

Or:

```bash
npm run firefox
```

Webpack config: `webpack.config.firefox.js`  
Manifest source: `public/manifest.firefox.json` (copied to `dist-firefox/manifest.json`)  
Add-on ID: `ai-rtl@ai-rtl.ir`

## Development

```bash
# Chrome watch build
npm run watch

# Firefox watch build
npm run firefox:dev

# Lint Firefox package
npm run firefox:lint
```

## Project structure

```text
src/
  background/     Background / service worker logic
  content/        Content scripts and per-site RTL logic
  popup/          Toolbar popup (React)
  options/        Options page (React)
  manual-rtl/     Manual RTL injection
  constants/      Shared config
public/
  manifest.chrome.json    Chrome / Chromium manifest
  manifest.firefox.json   Firefox manifest
  _locales/               Extension name/description strings
  images/ fonts/ css/     Static assets
scripts/
  build-chrome.js         Chrome release packaging
  build-firefox.js        Firefox production build + zip
  version-bump.js         Bump version in manifests and package.json
```

## Version bump

```bash
npm run version:bump
```

Updates:

- `package.json`
- `public/manifest.chrome.json` (Chrome)
- `public/manifest.firefox.json` (Firefox)

## Notes for store reviewers

### Chrome Web Store

- Source is TypeScript/React/JavaScript under `src/`.
- Production build is bundled with webpack: `npm install` then `npm run build:chrome`.
- Compare built `dist/` with the uploaded package.

### Firefox Add-ons (AMO)

- Source is TypeScript/React/JavaScript under `src/`.
- Production builds are bundled and minified with webpack.
- Build for review: `npm install` then `npm run build-for-amo`.
- Compare built `dist-firefox/` with the uploaded extension package.
- No remote code is downloaded or executed at runtime.

Source zip for AMO reviewers (excludes `node_modules`, `dist`, `releases`, etc.):

```bash
npm run zip:source
```

Output: `../ai-rtl-X.Y.Z.zip` (next to the project folder).

## License

All rights reserved. This repository is published for **viewing only**.

No permission is granted to use, copy, modify, distribute, sublicense, sell, commercially exploit, or fork this project. See [LICENSE](LICENSE) (`UNLICENSED`).

### Fonts

Bundled typefaces are licensed separately from the extension. Each family has its upstream license next to the font files. Index: [public/fonts/README.md](public/fonts/README.md).

Most families are SIL OFL 1.1 (Vazirmatn, Shabnam, Sahel, Samim, Parastoo, Gandom, Mikhak, Estedad, Arad, Nika, Behdad, GanjNameh, Shahab). Tanha and Nahid use the Bitstream Vera license from upstream.

IranYekan is a proprietary Fontiran typeface and is **not** in this repository. To build with IranYekan, place the licensed `.woff` files in `private/fonts/iranyekan/`. See `public/fonts/iranyekan/README.md`.
