# Browser Extensions Collection

[![Browser Extensions CI/CD](https://github.com/r00tmebaby/Browser-Extensions/actions/workflows/ci.yml/badge.svg)](https://github.com/r00tmebaby/Browser-Extensions/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

This repository hosts multiple browser extensions created by **r00tmebaby**. Each extension lives in its own folder with its own tests, build scripts, and documentation. The monorepo structure allows shared CI/CD with **auto-discovery** while maintaining independent development.

**🎯 Auto-Discovery**: The CI/CD automatically finds and tests ALL extensions in the repo - no configuration needed when adding new extensions!

## Current Extensions

### 🎵 Audio Normalizer & EQ (`Normaliser/`)

![Chrome](https://img.shields.io/badge/Chrome-✓-brightgreen?logo=googlechrome&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-✓-brightgreen?logo=microsoftedge&logoColor=white)
![Brave](https://img.shields.io/badge/Brave-✓-brightgreen?logo=brave&logoColor=white)

Real-time audio normalizer with 10-band parametric equalizer, volume boost, and visual spectrum analyzer. Features:
- Vertical EQ sliders (Winamp-style UI)
- 7 presets: Rock, Pop, Jazz, Classical, Bass, Vocal, Flat
- Per-site settings with allowlist
- Pre/Post audio meters with compression indicator
- No host permissions (uses `activeTab` + `scripting` for privacy)
- **Browser Support**: Chrome, Edge, Brave

### ♿ Universal Accessibility Enhancer (`Universal Accessibility Enhancer/`)

![Chrome](https://img.shields.io/badge/Chrome-✓-brightgreen?logo=googlechrome&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-✓-brightgreen?logo=firefoxbrowser&logoColor=white)
![Edge](https://img.shields.io/badge/Edge-✓-brightgreen?logo=microsoftedge&logoColor=white)
![Brave](https://img.shields.io/badge/Brave-✓-brightgreen?logo=brave&logoColor=white)

Makes websites accessible through customizable text, contrast, and layout adjustments. Features:
- Font customization (including OpenDyslexic, Atkinson Hyperlegible)
- Color filters for color blindness
- Focus mode, reduce motion, high contrast
- Per-site settings
- **Browser Support**: Chrome, Firefox, Edge, Brave

## Folder Structure

```
Chrome-Extensions/
├─ .github/
│  └─ workflows/
│     └─ ci.yml                           # Automated testing & builds
├─ Normaliser/
│  ├─ manifest.json
│  ├─ content.js
│  ├─ popup.html
│  ├─ popup.js
│  ├─ package.json                        # Dependencies & scripts
│  ├─ tests/
│  │  ├─ unit/                            # Jest unit tests
│  │  ├─ e2e/                             # Puppeteer E2E tests
│  │  └─ README.md
│  ├─ scripts/
│  │  ├─ verify.js                        # Manifest validation
│  │  └─ package.js                       # Create .zip for Web Store
│  ├─ Readme.md
│  └─ privacy-policy.md
├─ Universal Accessibility Enhancer/
│  ├─ src/                                # Source files
│  ├─ build/                              # Built extensions
│  │  ├─ chrome/
│  │  └─ firefox/
│  ├─ tests/
│  │  ├─ unit/                            # Jest unit tests
│  │  ├─ e2e/                             # Puppeteer E2E tests
│  │  └─ README.md
│  ├─ scripts/                            # Build & packaging
│  ├─ package.json
│  └─ Readme.md
├─ package.json                           # Root workspace scripts
└─ Readme.md                              # This file
```

## Install (Developer Mode)

1. **Download or clone** this repository:
   ```bash
   git clone https://github.com/r00tmebaby/Browser-Extensions.git
   cd Browser-Extensions
   ```

2. **Open Extensions page**:
   - **Chrome/Edge/Brave**: Navigate to `chrome://extensions/` or `edge://extensions/`
   - **Firefox**: Navigate to `about:debugging#/runtime/this-firefox`

3. **Enable Developer mode**:
   - **Chrome/Edge/Brave**: Toggle "Developer mode" in the top-right corner
   - **Firefox**: Click "Load Temporary Add-on"

4. **Load an extension**:
   - **Chrome/Edge/Brave**: Click **"Load unpacked"**
     - For **Normaliser**: Select `Normaliser/` folder
     - For **UAE**: Select `Universal Accessibility Enhancer/build/chrome/` folder
   - **Firefox**: 
     - For **UAE**: Select `Universal Accessibility Enhancer/build/firefox/manifest.json`

5. **Use the extension**:
   - Extension icon appears in browser toolbar
   - Click icon to open popup and apply settings

## Testing & Development

### Run All Tests (from root)

```bash
# Install all dependencies
npm run install:all

# Run all unit tests
npm test

# Run all E2E tests
npm run test:e2e

# Verify manifests
npm run verify
```

### Test Individual Extensions

#### Normaliser
```bash
cd Normaliser
npm install
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run verify        # Validate manifest
```

#### Universal Accessibility Enhancer
```bash
cd "Universal Accessibility Enhancer"
npm install
npm test              # Unit tests
npm run test:e2e      # E2E tests
npm run build:all     # Build for Chrome & Firefox
npm run verify        # Validate build
```

### Continuous Integration
- ✅ **Auto-discovers all extensions** (no configuration needed!)

- ✅ Only tests changed extensions (smart detection)
GitHub Actions automatically:
- ✅ Runs tests on every push/PR
- ✅ Validates manifests
- ✅ Creates release packages
- ✅ Only tests changed extensions (smart detection)

### Adding a New Extension

Want to add a new extension? It's automatic!

1. Create a new folder: `MyExtension/`
2. Add `manifest.json` (browser extension manifest)
3. Add `package.json` with test scripts:
   ```json
   {
     "name": "my-extension",
     "scripts": {
       "test": "jest",
       "verify": "node scripts/verify.js"
     }
   }
   ```
4. Add your code and tests
5. Push to GitHub

**That's it!** The CI/CD automatically:
- 🔍 Discovers your new extension
- 🧪 Adds it to the test matrix
- ✅ Runs tests on every push
- 📦 Creates release packages

**No workflow updates needed!**

See `.github/workflows/ci.yml` for configuration.

## Building for Production

### Normaliser
```bash
cd Normaliser
npm install
npm run verify        # Validate
npm run package       # Creates .zip for Chrome Web Store
```

### Universal Accessibility Enhancer
```bash
cd "Universal Accessibility Enhancer"
npm install
npm run build:all     # Build Chrome & Firefox versions
npm run zip:all       # Create .zip packages
```

## Privacy & Permissions

### No Host Permissions (Normaliser)
- Does **not** declare `host_permissions` or auto-inject content scripts
- Uses `activeTab` + `scripting` to inject only when popup is opened
- Works on the currently active tab only
- Re-open popup after changing tabs to re-inject
- **Benefit**: Faster Chrome Web Store review process

### Minimal Permissions (UAE)
- Only requests permissions needed for functionality
- All processing happens locally in your browser
- No data collection or external communication
- See individual `privacy-policy.md` files for details

## Updating an Extension

1. Make changes to files inside the extension folder
2. Go to `chrome://extensions/`
3. Click **Reload** (↻) button on the extension card
4. Reopen popup to see changes

## Troubleshooting

### Normaliser
- **No activity in popup**: Interact with page (play/pause) to allow AudioContext
- **Extension not working after tab change**: Reopen popup to re-inject
- **Audio distortion**: Lower volume boost or EQ gains

### Universal Accessibility Enhancer
- **Changes not applying**: Check if site is in allowlist (if enabled)
- **Font not changing**: Some sites override fonts with `!important`
- **Extension not working on special pages**: Chrome doesn't allow extensions on `chrome://` URLs

### General
- Open DevTools (F12) → Console to check for errors
- Check that extension is enabled in `chrome://extensions/`
- Repository: [Browser-Extensions](https://github.com/r00tmebaby/Browser-Extensions)

## Contributing

**Note**: This is a monorepo containing multiple independent browser extensions. Each extension can be developed, tested, and published separately, but shares common CI/CD infrastructure with **auto-discovery** for quality assurance. Add new extensions without touching the CI/CD configuration!

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -am 'Add my feature'`
6. Push: `git push origin feature/my-feature`
7. Create a Pull Request

### Code Quality Standards

- All tests must pass before merging
- Add tests for new features
- Follow existing code style
- Update documentation as needed

## License

MIT License - See individual extension folders for specific license files.

## Author

**r00tmebaby**

- GitHub: [@r00tmebaby](https://github.com/r00tmebaby)
- Repository: [Browser-Extensions](https://github.com/r00tmebaby/Browser-Extensions)

---

**Note**: This is a monorepo containing multiple independent browser extensions. Each extension can be developed, tested, and published separately, but shares common CI/CD infrastructure with **auto-discovery** for quality assurance. Add new extensions without touching the CI/CD configuration!

---

**Note**: This is a monorepo containing multiple independent Chrome extensions. Each extension can be developed, tested, and published separately, but shares common CI/CD infrastructure for quality assurance.
- Create a new folder for your extension with a `manifest.json` and code.
- Document it in `Readme.md` and test via Developer mode.

## License
Unless otherwise stated in a per‑extension folder, assume these extensions are provided "as is" by **r00tmebaby**. Add license details here if you choose a specific license (MIT, GPL, etc.).

---
Feel free to open issues or pull requests for improvements and new extension ideas.
