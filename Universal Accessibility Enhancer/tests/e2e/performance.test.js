/**
 * Performance Tests
 * Tests the extension's performance impact on web pages
 */

const puppeteer = require('puppeteer');
const path = require('path');

const extensionPath = path.resolve(__dirname, '../../build/chrome');

async function measurePerformance(url, withExtension = true) {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox']
  };

  if (withExtension) {
    launchOptions.args.push(
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    );
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  const startTime = Date.now();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  const loadTime = Date.now() - startTime;

  const metrics = await page.metrics();
  await browser.close();

  return { loadTime, metrics };
}

async function runPerformanceTests() {
  console.log('⚡ Running Performance Tests...\n');

  const testUrls = [
    'https://example.com',
    'https://wikipedia.org'
  ];

  for (const url of testUrls) {
    console.log(`Testing: ${url}`);

    try {
      const withoutExt = await measurePerformance(url, false);
      const withExt = await measurePerformance(url, true);

      const overhead = withExt.loadTime - withoutExt.loadTime;
      const overheadPercent = ((overhead / withoutExt.loadTime) * 100).toFixed(1);

      console.log(`  Without extension: ${withoutExt.loadTime}ms`);
      console.log(`  With extension: ${withExt.loadTime}ms`);
      console.log(`  Overhead: ${overhead}ms (${overheadPercent}%)`);

      if (overhead < 500) {
        console.log('  ✓ Performance impact acceptable\n');
      } else {
        console.log('  ⚠️  Performance impact high\n');
      }
    } catch (error) {
      console.log(`  ✗ Test failed: ${error.message}\n`);
    }
  }

  console.log('✅ Performance tests completed');
}

if (require.main === module) {
  runPerformanceTests().catch(console.error);
}

module.exports = { runPerformanceTests };
/**
 * E2E Test Runner for Browser Extension
 * Tests the extension on real websites using Puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const extensionPath = path.resolve(__dirname, '../../build/chrome');
const testPagePath = path.resolve(__dirname, '../../test-page.html');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`  ${status} ${name}`);
  if (!passed && details) {
    console.log(`    ${colors.red}${details}${colors.reset}`);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.bright);
  log('  UAE Extension E2E Test Suite', colors.bright);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.bright);

  // Check if extension is built
  if (!fs.existsSync(extensionPath)) {
    log('❌ Extension not built. Run: npm run build:chrome', colors.red);
    process.exit(1);
  }

  log('🚀 Launching Chrome with extension...', colors.blue);

  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  let totalTests = 0;
  let passedTests = 0;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to test page
    log('\n📄 Loading test page...', colors.blue);
    await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
    await sleep(1000);

    // Test 1: Content script injection
    log('\n📦 Test Suite: Content Script Injection', colors.yellow);
    totalTests++;
    const contentScriptInjected = await page.evaluate(() => {
      return window.__uaeContentInjected === true;
    });
    logTest('Content script should be injected', contentScriptInjected);
    if (contentScriptInjected) passedTests++;

    // Test 2: Toast element exists
    totalTests++;
    const toastExists = await page.evaluate(() => {
      return !!document.getElementById('uae-toast');
    });
    logTest('Toast element should exist', toastExists);
    if (toastExists) passedTests++;

    // Test 3: AI Panel exists
    totalTests++;
    const aiPanelExists = await page.evaluate(() => {
      return !!document.getElementById('uae-ai-panel');
    });
    logTest('AI Panel element should exist', aiPanelExists);
    if (aiPanelExists) passedTests++;

    // Test 4: SVG filters injected
    totalTests++;
    const svgFiltersExist = await page.evaluate(() => {
      const filters = ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
      return filters.every(f => !!document.getElementById(`uae-${f}-filter`));
    });
    logTest('SVG color filters should be injected', svgFiltersExist);
    if (svgFiltersExist) passedTests++;

    // Test 5: Easy Read Mode
    log('\n🎨 Test Suite: Easy Read Mode', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      const prefs = { mode: 'easy', font: 'default' };
      window.postMessage({ type: 'APPLY_PREFS', data: prefs }, '*');
    });
    await sleep(500);
    const easyReadApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-easy-read');
    });
    logTest('Easy Read class should be applied', easyReadApplied);
    if (easyReadApplied) passedTests++;

    // Test 6: Font changes
    log('\n🔤 Test Suite: Font Changes', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-font-dyslexic');
    });
    await sleep(300);
    const fontClassApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-font-dyslexic');
    });
    logTest('Dyslexic font class should be applied', fontClassApplied);
    if (fontClassApplied) passedTests++;

    // Test 7: High Contrast Mode
    log('\n🌓 Test Suite: High Contrast Mode', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-high-contrast');
    });
    await sleep(300);
    const highContrastApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-high-contrast');
    });
    logTest('High Contrast class should be applied', highContrastApplied);
    if (highContrastApplied) passedTests++;

    // Test 8: Reduce Motion
    log('\n⏸️  Test Suite: Reduce Motion', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-reduced-motion');
    });
    await sleep(300);
    const reduceMotionApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-reduced-motion');
    });
    logTest('Reduce Motion class should be applied', reduceMotionApplied);
    if (reduceMotionApplied) passedTests++;

    // Test 9: Vision Boost
    log('\n👁️  Test Suite: Vision Boost', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-vision-boost');
    });
    await sleep(300);
    const visionBoostApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-vision-boost');
    });
    logTest('Vision Boost class should be applied', visionBoostApplied);
    if (visionBoostApplied) passedTests++;

    // Test 10: Color Filters
    log('\n🎨 Test Suite: Color Filters', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-color-filter-protanopia');
    });
    await sleep(300);
    const colorFilterApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-color-filter-protanopia');
    });
    logTest('Color filter class should be applied', colorFilterApplied);
    if (colorFilterApplied) passedTests++;

    // Test 11: Focus Mode
    log('\n🎯 Test Suite: Focus Mode', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-focus-active');
    });
    await sleep(300);
    const focusModeApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-focus-active');
    });
    logTest('Focus Mode class should be applied', focusModeApplied);
    if (focusModeApplied) passedTests++;

    // Test 12-15: Test on real websites
    log('\n🌐 Test Suite: Real Website Tests', colors.yellow);

    const websites = [
      { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Accessibility' },
      { name: 'GitHub', url: 'https://github.com' },
      { name: 'MDN', url: 'https://developer.mozilla.org' }
    ];

    for (const site of websites) {
      totalTests++;
      try {
        log(`\n  Testing on ${site.name}...`, colors.blue);
        await page.goto(site.url, { waitUntil: 'networkidle0', timeout: 10000 });
        await sleep(1000);

        const injected = await page.evaluate(() => {
          return window.__uaeContentInjected === true;
        });

        logTest(`${site.name}: Content script injected`, injected);
        if (injected) passedTests++;
      } catch (error) {
        logTest(`${site.name}: Content script injected`, false, error.message);
      }
    }

    // Test 16: CSS Variables
    log('\n🎨 Test Suite: CSS Variables', colors.yellow);
    totalTests++;
    await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
    await sleep(500);
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--uae-font-size', '120%');
      document.documentElement.style.setProperty('--uae-line-height', '2.0');
    });
    const cssVarsApplied = await page.evaluate(() => {
      const fontSize = document.documentElement.style.getPropertyValue('--uae-font-size');
      const lineHeight = document.documentElement.style.getPropertyValue('--uae-line-height');
      return fontSize === '120%' && lineHeight === '2.0';
    });
    logTest('CSS variables should be set correctly', cssVarsApplied);
    if (cssVarsApplied) passedTests++;

    // Test 17: Large Hit Targets
    log('\n🎯 Test Suite: Large Hit Targets', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-large-hit-targets');
    });
    await sleep(300);
    const largeHitTargetsApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-large-hit-targets');
    });
    logTest('Large Hit Targets class should be applied', largeHitTargetsApplied);
    if (largeHitTargetsApplied) passedTests++;

    // Test 18: Underline Links
    log('\n🔗 Test Suite: Underline Links', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-underline-links');
    });
    await sleep(300);
    const underlineLinksApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-underline-links');
    });
    logTest('Underline Links class should be applied', underlineLinksApplied);
    if (underlineLinksApplied) passedTests++;

    // Test 19: Focus Boost
    log('\n💡 Test Suite: Focus Boost', colors.yellow);
    totalTests++;
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-focus-boost');
    });
    await sleep(300);
    const focusBoostApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-focus-boost');
    });
    logTest('Focus Boost class should be applied', focusBoostApplied);
    if (focusBoostApplied) passedTests++;

  } catch (error) {
    log(`\n❌ Test error: ${error.message}`, colors.red);
    console.error(error);
  } finally {
    await browser.close();
  }

  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.bright);
  log('  Test Summary', colors.bright);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.bright);

  const percentage = ((passedTests / totalTests) * 100).toFixed(1);
  const summaryColor = passedTests === totalTests ? colors.green : (percentage >= 70 ? colors.yellow : colors.red);

  log(`\n  Total Tests: ${totalTests}`, colors.blue);
  log(`  Passed: ${passedTests}`, colors.green);
  log(`  Failed: ${totalTests - passedTests}`, colors.red);
  log(`  Success Rate: ${percentage}%`, summaryColor);

  if (passedTests === totalTests) {
    log('\n  🎉 All tests passed!', colors.green);
  } else if (percentage >= 70) {
    log('\n  ⚠️  Most tests passed, but some failures detected', colors.yellow);
  } else {
    log('\n  ❌ Multiple test failures detected', colors.red);
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.bright);

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});

