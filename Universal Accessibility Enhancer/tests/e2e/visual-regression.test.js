/**
 * Visual Regression Tests
 * Takes screenshots and compares them to detect UI changes
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const extensionPath = path.resolve(__dirname, '../../build/chrome');
const screenshotsDir = path.resolve(__dirname, '../screenshots');
const baselineDir = path.join(screenshotsDir, 'baseline');
const currentDir = path.join(screenshotsDir, 'current');
const diffDir = path.join(screenshotsDir, 'diff');

// Ensure directories exist
[screenshotsDir, baselineDir, currentDir, diffDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filename = `${name}.png`;
  const filepath = path.join(currentDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

function compareImages(baseline, current, diff) {
  if (!fs.existsSync(baseline)) {
    // No baseline exists, copy current as baseline
    fs.copyFileSync(current, baseline);
    return { match: true, isNewBaseline: true, diffPixels: 0 };
  }

  const img1 = PNG.sync.read(fs.readFileSync(baseline));
  const img2 = PNG.sync.read(fs.readFileSync(current));

  const { width, height } = img1;
  const diffImg = new PNG({ width, height });

  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diffImg.data,
    width,
    height,
    { threshold: 0.1 }
  );

  if (diffPixels > 0) {
    fs.writeFileSync(diff, PNG.sync.write(diffImg));
  }

  const totalPixels = width * height;
  const diffPercentage = (diffPixels / totalPixels) * 100;

  return {
    match: diffPixels === 0,
    isNewBaseline: false,
    diffPixels,
    diffPercentage: diffPercentage.toFixed(2)
  };
}

async function runVisualRegressionTests() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('  Visual Regression Test Suite', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.magenta);

  if (!fs.existsSync(extensionPath)) {
    log('❌ Extension not built. Run: npm run build:chrome', colors.red);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const testPagePath = path.resolve(__dirname, '../../test-page.html');
  await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
  await sleep(1000);

  const testScenarios = [
    {
      name: 'default-state',
      description: 'Default page (no modifications)',
      setup: async () => {}
    },
    {
      name: 'easy-read-mode',
      description: 'Easy Read Mode enabled',
      setup: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.add('uae-easy-read');
        });
      }
    },
    {
      name: 'high-contrast',
      description: 'High Contrast Mode',
      setup: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.remove('uae-easy-read');
          document.documentElement.classList.add('uae-high-contrast');
        });
      }
    },
    {
      name: 'dyslexic-font',
      description: 'OpenDyslexic Font',
      setup: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.remove('uae-high-contrast');
          document.documentElement.classList.add('uae-font-dyslexic');
          document.documentElement.style.fontFamily = 'OpenDyslexic, sans-serif';
        });
      }
    },
    {
      name: 'vision-boost',
      description: 'Vision Boost Mode',
      setup: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.remove('uae-font-dyslexic');
          document.documentElement.style.fontFamily = '';
          document.documentElement.classList.add('uae-vision-boost');
        });
      }
    },
    {
      name: 'reduced-motion',
      description: 'Reduced Motion',
      setup: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.remove('uae-vision-boost');
          document.documentElement.classList.add('uae-reduced-motion');
        });
      }
    },
    {
      name: 'large-text',
      description: 'Large Text (140%)',
      setup: async () => {
        await page.evaluate(() => {
          document.documentElement.classList.remove('uae-reduced-motion');
          document.documentElement.style.setProperty('--uae-font-size', '140%');
        });
      }
    },
    {
      name: 'color-filter-protanopia',
      description: 'Protanopia Color Filter',
      setup: async () => {
        await page.evaluate(() => {
          document.documentElement.style.setProperty('--uae-font-size', '100%');
          document.documentElement.classList.add('uae-color-filter-protanopia');
        });
      }
    }
  ];

  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let newBaselines = 0;

  for (const scenario of testScenarios) {
    log(`\n📸 Testing: ${scenario.description}`, colors.blue);

    // Reset page
    await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });
    await sleep(500);

    // Apply scenario
    await scenario.setup();
    await sleep(500);

    // Take screenshot
    const currentPath = await takeScreenshot(page, scenario.name);
    const baselinePath = path.join(baselineDir, `${scenario.name}.png`);
    const diffPath = path.join(diffDir, `${scenario.name}.png`);

    // Compare
    const comparison = compareImages(baselinePath, currentPath, diffPath);

    totalTests++;
    if (comparison.match) {
      passedTests++;
      if (comparison.isNewBaseline) {
        newBaselines++;
        log(`   ✓ NEW BASELINE created`, colors.yellow);
      } else {
        log(`   ✓ MATCH - No visual changes`, colors.green);
      }
    } else {
      log(`   ✗ CHANGED - ${comparison.diffPixels} pixels different (${comparison.diffPercentage}%)`, colors.red);
      log(`   📄 Diff saved: ${diffPath}`, colors.yellow);
    }

    results.push({ ...scenario, ...comparison });
  }

  await browser.close();

  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('  Visual Regression Summary', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);

  log(`\n  Total Scenarios: ${totalTests}`, colors.blue);
  log(`  Matches: ${passedTests}`, colors.green);
  log(`  Changes: ${totalTests - passedTests}`, totalTests - passedTests > 0 ? colors.red : colors.green);
  log(`  New Baselines: ${newBaselines}`, newBaselines > 0 ? colors.yellow : colors.green);

  log(`\n  Screenshots saved in: ${screenshotsDir}`, colors.blue);
  log(`    - Baseline: ${baselineDir}`, colors.blue);
  log(`    - Current: ${currentDir}`, colors.blue);
  log(`    - Diff: ${diffDir}`, colors.blue);

  if (totalTests - passedTests > 0) {
    log('\n  ⚠️  Visual changes detected!', colors.yellow);
    log('  Review the diff images and update baselines if changes are intentional:', colors.yellow);
    log('  1. Review images in: ' + diffDir, colors.yellow);
    log('  2. If OK, copy from current/ to baseline/', colors.yellow);
  } else if (newBaselines > 0) {
    log('\n  📝 New baselines created for future comparisons', colors.yellow);
  } else {
    log('\n  🎉 All visual tests passed!', colors.green);
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.magenta);

  process.exit(0); // Visual regression doesn't fail build, just reports
}

if (require.main === module) {
  runVisualRegressionTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runVisualRegressionTests };

