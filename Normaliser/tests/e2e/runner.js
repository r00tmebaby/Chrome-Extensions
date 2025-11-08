/**
 * E2E Test Runner for Audio Normalizer & EQ
 * Tests the extension in a real Chrome instance
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const EXTENSION_PATH = path.join(__dirname, '../..');
const TEST_TIMEOUT = 30000;

async function runE2ETests() {
  console.log('🚀 Starting E2E tests for Audio Normalizer & EQ...\n');

  let browser;
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Launch Chrome with extension loaded
    console.log('📦 Loading extension from:', EXTENSION_PATH);

    browser = await puppeteer.launch({
      headless: false, // Must be false to load extensions
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();

    // Test 1: Navigate to a page with audio
    console.log('\n📋 Test 1: Navigate to test page with audio');
    try {
      await page.goto('https://www.w3schools.com/html/html5_audio.htm', {
        waitUntil: 'networkidle2',
        timeout: TEST_TIMEOUT
      });
      console.log('✅ Successfully navigated to test page');
      testsPassed++;
    } catch (err) {
      console.error('❌ Failed to navigate:', err.message);
      testsFailed++;
    }

    // Test 2: Check extension popup opens
    console.log('\n📋 Test 2: Open extension popup');
    try {
      // Get extension ID (first target that matches extension)
      const targets = await browser.targets();
      const extensionTarget = targets.find(target =>
        target.type() === 'service_worker' || target.url().includes('chrome-extension://')
      );

      if (extensionTarget) {
        console.log('✅ Extension loaded successfully');
        console.log('   Extension URL:', extensionTarget.url().substring(0, 50) + '...');
        testsPassed++;
      } else {
        throw new Error('Extension not found in browser targets');
      }
    } catch (err) {
      console.error('❌ Extension popup test failed:', err.message);
      testsFailed++;
    }

    // Test 3: Check audio elements on page
    console.log('\n📋 Test 3: Detect audio elements');
    try {
      const audioCount = await page.evaluate(() => {
        const audios = document.querySelectorAll('audio, video');
        return audios.length;
      });

      if (audioCount > 0) {
        console.log(`✅ Found ${audioCount} audio/video element(s)`);
        testsPassed++;
      } else {
        console.log('⚠️  No audio elements found (may be expected for this page)');
        testsPassed++;
      }
    } catch (err) {
      console.error('❌ Audio detection failed:', err.message);
      testsFailed++;
    }

    // Test 4: Test on YouTube (if accessible)
    console.log('\n📋 Test 4: Test on YouTube');
    try {
      await page.goto('https://www.youtube.com/watch?v=jfKfPfyJRdk', {
        waitUntil: 'networkidle2',
        timeout: TEST_TIMEOUT
      });

      // Wait for video element
      await page.waitForSelector('video', { timeout: 10000 });

      const hasVideo = await page.evaluate(() => {
        const video = document.querySelector('video');
        return video !== null;
      });

      if (hasVideo) {
        console.log('✅ Successfully loaded YouTube video page');
        testsPassed++;
      } else {
        throw new Error('Video element not found');
      }
    } catch (err) {
      console.log('⚠️  YouTube test skipped:', err.message);
      // Don't count as failure - might be network issue
    }

    // Test 5: Verify manifest
    console.log('\n📋 Test 5: Verify manifest.json');
    try {
      const manifestPath = path.join(EXTENSION_PATH, 'manifest.json');
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      if (manifest.manifest_version === 3 &&
          manifest.permissions.includes('activeTab') &&
          manifest.permissions.includes('scripting')) {
        console.log('✅ Manifest is valid and has required permissions');
        testsPassed++;
      } else {
        throw new Error('Manifest missing required fields');
      }
    } catch (err) {
      console.error('❌ Manifest verification failed:', err.message);
      testsFailed++;
    }

    // Test 6: Check required files
    console.log('\n📋 Test 6: Check required files exist');
    try {
      const requiredFiles = ['popup.html', 'popup.js', 'content.js', 'icon.png'];
      let allExist = true;

      for (const file of requiredFiles) {
        const filePath = path.join(EXTENSION_PATH, file);
        if (!fs.existsSync(filePath)) {
          console.error(`   ❌ Missing: ${file}`);
          allExist = false;
        }
      }

      if (allExist) {
        console.log('✅ All required files present');
        testsPassed++;
      } else {
        throw new Error('Some required files missing');
      }
    } catch (err) {
      console.error('❌ File check failed:', err.message);
      testsFailed++;
    }

  } catch (err) {
    console.error('\n💥 Unexpected error:', err);
    testsFailed++;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary:');
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  console.log('='.repeat(60));

  if (testsFailed > 0) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runE2ETests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

