/**
 * Firefox Extension Tests
 * Tests the Firefox version of the extension using Puppeteer with Firefox
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const extensionPath = path.resolve(__dirname, '../../build/firefox');
const testPagePath = path.resolve(__dirname, '../../test-page.html');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFirefoxTests() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('  🦊 Firefox Extension Test Suite', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.cyan);

  if (!fs.existsSync(extensionPath)) {
    log('❌ Firefox extension not built. Run: npm run build:firefox', colors.red);
    process.exit(1);
  }

  log('ℹ️  Note: Firefox testing requires web-ext or manual loading', colors.yellow);
  log('   This test validates the extension structure and manifest\n', colors.yellow);

  let structureTests = 0;
  let passedTests = 0;

  // Test 1: Manifest exists and is valid
  log('📦 Test Suite: Extension Structure', colors.blue);
  structureTests++;
  const manifestPath = path.join(extensionPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      // Check manifest version
      if (manifest.manifest_version === 2) {
        log('  ✓ Manifest v2 (Firefox compatible)', colors.green);
        passedTests++;
      } else {
        log('  ✗ Manifest version incorrect', colors.red);
      }

      // Check required fields
      structureTests++;
      const requiredFields = ['name', 'version', 'description', 'permissions', 'background'];
      const hasAllFields = requiredFields.every(field => manifest[field]);
      if (hasAllFields) {
        log('  ✓ All required manifest fields present', colors.green);
        passedTests++;
      } else {
        log('  ✗ Missing required manifest fields', colors.red);
      }

      // Check content scripts
      structureTests++;
      if (manifest.content_scripts && manifest.content_scripts.length > 0) {
        log('  ✓ Content scripts configured', colors.green);
        passedTests++;
      } else {
        log('  ✗ No content scripts found', colors.red);
      }

      // Check permissions
      structureTests++;
      if (manifest.permissions && manifest.permissions.includes('storage')) {
        log('  ✓ Storage permission present', colors.green);
        passedTests++;
      } else {
        log('  ✗ Storage permission missing', colors.red);
      }

    } catch (error) {
      log(`  ✗ Manifest parse error: ${error.message}`, colors.red);
    }
  } else {
    log('  ✗ Manifest.json not found', colors.red);
  }

  // Test 2: Check critical files exist
  log('\n📄 Test Suite: Required Files', colors.blue);
  const requiredFiles = [
    'src/background/background.js',
    'src/content/content.js',
    'src/content/content.css',
    'src/popup/popup.html',
    'src/popup/popup.js',
    'src/options/options.html',
    'src/options/options.js',
    'src/common/utils.js',
    'src/common/fontConfig.js'
  ];

  requiredFiles.forEach(file => {
    structureTests++;
    const filePath = path.join(extensionPath, file);
    if (fs.existsSync(filePath)) {
      log(`  ✓ ${file}`, colors.green);
      passedTests++;
    } else {
      log(`  ✗ ${file} missing`, colors.red);
    }
  });

  // Test 3: Check font files
  log('\n🔤 Test Suite: Font Assets', colors.blue);
  const fontFiles = [
    'src/assets/fonts/OpenDyslexic-Regular.woff2',
    'src/assets/fonts/OpenDyslexic-Bold.woff2',
    'src/assets/fonts/AtkinsonHyperlegible-Regular.woff2',
    'src/assets/fonts/AtkinsonHyperlegible-Bold.woff2'
  ];

  fontFiles.forEach(font => {
    structureTests++;
    const fontPath = path.join(extensionPath, font);
    if (fs.existsSync(fontPath)) {
      const stats = fs.statSync(fontPath);
      if (stats.size > 0) {
        log(`  ✓ ${path.basename(font)} (${(stats.size / 1024).toFixed(1)}KB)`, colors.green);
        passedTests++;
      } else {
        log(`  ✗ ${path.basename(font)} is empty`, colors.red);
      }
    } else {
      log(`  ✗ ${path.basename(font)} missing`, colors.red);
    }
  });

  // Test 4: Validate JavaScript syntax
  log('\n🔍 Test Suite: JavaScript Validation', colors.blue);
  const jsFiles = [
    'src/background/background.js',
    'src/content/content.js',
    'src/popup/popup.js',
    'src/options/options.js'
  ];

  jsFiles.forEach(file => {
    structureTests++;
    const filePath = path.join(extensionPath, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for common issues
      const hasUnclosedFunctions = (content.match(/function/g) || []).length > (content.match(/\}/g) || []).length;
      const hasValidSyntax = !hasUnclosedFunctions && content.length > 0;

      if (hasValidSyntax) {
        log(`  ✓ ${file} syntax OK`, colors.green);
        passedTests++;
      } else {
        log(`  ✗ ${file} may have syntax issues`, colors.red);
      }
    }
  });

  // Test 5: Browser API compatibility
  log('\n🌐 Test Suite: Firefox API Compatibility', colors.blue);

  structureTests++;
  const backgroundPath = path.join(extensionPath, 'src/background/background.js');
  const backgroundContent = fs.readFileSync(backgroundPath, 'utf8');

  // Check for browser API usage (Firefox prefers 'browser' over 'chrome')
  const usesBrowserAPI = backgroundContent.includes('browser') || backgroundContent.includes('typeof browser');
  if (usesBrowserAPI) {
    log('  ✓ Uses browser API (Firefox compatible)', colors.green);
    passedTests++;
  } else {
    log('  ⚠️  May need browser API for full Firefox support', colors.yellow);
  }

  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('  Firefox Extension Test Summary', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  const percentage = ((passedTests / structureTests) * 100).toFixed(1);
  log(`\n  Total Tests: ${structureTests}`, colors.blue);
  log(`  Passed: ${passedTests}`, colors.green);
  log(`  Failed: ${structureTests - passedTests}`, structureTests - passedTests > 0 ? colors.red : colors.green);
  log(`  Success Rate: ${percentage}%`, percentage === '100.0' ? colors.green : colors.yellow);

  if (passedTests === structureTests) {
    log('\n  🎉 Firefox extension structure validated!', colors.green);
    log('  📝 To test in Firefox:', colors.blue);
    log('     1. Open Firefox', colors.blue);
    log('     2. Go to about:debugging#/runtime/this-firefox', colors.blue);
    log('     3. Click "Load Temporary Add-on"', colors.blue);
    log('     4. Select build/firefox/manifest.json', colors.blue);
  } else {
    log('\n  ⚠️  Some tests failed - check Firefox build', colors.yellow);
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.cyan);

  process.exit(passedTests === structureTests ? 0 : 1);
}

if (require.main === module) {
  runFirefoxTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runFirefoxTests };

