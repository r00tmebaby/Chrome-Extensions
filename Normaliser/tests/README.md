# Test Suite for Audio Normalizer & EQ

## Overview

Automated testing suite for the Audio Normalizer & EQ Chrome extension, ensuring quality and reliability.

## Test Coverage

### Unit Tests (Jest)
- **Manifest validation** - Ensures compliance with Chrome Extension Manifest V3
- **EQ presets** - Validates all equalizer presets (Rock, Pop, Jazz, etc.)
- **Frequency bands** - Tests 10-band parametric EQ configuration
- **Storage schema** - Verifies user preferences structure
- **File structure** - Confirms all required files exist
- **HTML structure** - Validates popup UI elements

### E2E Tests (Puppeteer)
- **Extension loading** - Verifies extension loads in Chrome
- **Audio detection** - Tests audio/video element detection
- **Real-world sites** - Tests on actual websites (YouTube, W3Schools)
- **Popup functionality** - Ensures popup opens and displays correctly
- **File integrity** - Checks all required assets are present

## Running Tests

### Quick Start

```bash
# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Run specific test types
npm run test:e2e       # E2E tests (opens Chrome)
npm run verify         # Manifest verification
npm run test:coverage  # With coverage report
```

### Watch Mode (Development)

```bash
npm run test:watch
```

Tests automatically re-run when you save files.

### Full Test Suite

```bash
npm run test:all
```

Runs verification + unit tests + E2E tests.

## Test Files

```
tests/
├── unit/
│   └── normaliser.test.js    # Core unit tests
├── e2e/
│   └── runner.js             # End-to-end tests
└── README.md                 # This file
```

## What Gets Tested

### ✅ Manifest V3 Compliance
- Correct manifest version
- Required permissions (activeTab, scripting, storage)
- No host_permissions (for faster Chrome Web Store review)
- Proper popup configuration

### ✅ EQ Functionality
- 10 frequency bands (30Hz - 16kHz)
- 7 presets: Flat, Rock, Pop, Jazz, Classical, Bass, Vocal
- Gain range: -12dB to +12dB
- Volume boost: 0.1x to 3.0x

### ✅ UI Components
- EQ sliders (vertical, 10 bands)
- Volume control
- Preset selector
- Settings tab
- Site allowlist
- Author credits & GitHub link

### ✅ Real-World Usage
- Works on YouTube
- Works on generic HTML5 audio pages
- Extension icon appears in toolbar
- Popup opens without errors

## CI/CD Integration

Tests run automatically on:
- Every push to `main` branch
- Every pull request
- Via GitHub Actions workflow

See `.github/workflows/ci.yml` for configuration.

## Writing New Tests

### Unit Test Example

```javascript
const { test, expect } = require('@jest/globals');

test('my new feature works', () => {
  expect(myFeature()).toBe(expectedValue);
});
```

### E2E Test Example

```javascript
// Add to tests/e2e/runner.js
console.log('\n📋 Test: My new feature');
const result = await page.evaluate(() => {
  // Test code here
  return true;
});
expect(result).toBe(true);
```

## Debugging Failed Tests

### Unit Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- normaliser.test.js
```

### E2E Tests

E2E tests run in **non-headless** mode so you can see what's happening:
- Chrome window opens automatically
- Watch the browser interact with pages
- Check console for errors

To debug:
1. Run: `npm run test:e2e`
2. Watch the browser window
3. Check terminal output for errors

## Performance

- **Unit tests**: ~1-2 seconds
- **E2E tests**: ~10-20 seconds (depends on network)
- **Full suite**: ~30 seconds

## Requirements

- Node.js 18+
- Chrome/Chromium browser
- Internet connection (for E2E tests)

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### E2E tests timeout
- Check internet connection
- Some sites (YouTube) may be slow - this is normal
- Increase timeout in `runner.js` if needed

### Extension not loading in E2E
- Verify `manifest.json` is valid
- Check all required files exist
- Run `npm run verify` first

## Code Coverage

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` folder.

## Author

**r00tmebaby**  
GitHub: https://github.com/r00tmebaby/Browser-Extensions

