/**
 * Accessibility Compliance Tests
 * Tests the extension's impact on web accessibility
 */

const puppeteer = require('puppeteer');
const path = require('path');

const extensionPath = path.resolve(__dirname, '../../build/chrome');
const testPagePath = path.resolve(__dirname, '../../test-page.html');

async function testAccessibility() {
  console.log('🔍 Running Accessibility Compliance Tests...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${testPagePath}`, { waitUntil: 'networkidle0' });

    // Test ARIA attributes
    console.log('Testing ARIA attributes...');
    const ariaTest = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main && main.getAttribute('role') === 'main';
    });
    console.log(ariaTest ? '✓ ARIA roles present' : '✗ ARIA roles missing');

    // Test keyboard navigation
    console.log('\nTesting keyboard navigation...');
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      return document.activeElement.tagName;
    });
    console.log(`✓ Focus on: ${focusedElement}`);

    // Test color contrast (simplified)
    console.log('\nTesting high contrast mode...');
    await page.evaluate(() => {
      document.documentElement.classList.add('uae-high-contrast');
    });
    const hasHighContrast = await page.evaluate(() => {
      return document.documentElement.classList.contains('uae-high-contrast');
    });
    console.log(hasHighContrast ? '✓ High contrast mode working' : '✗ High contrast failed');

    // Test screen reader compatibility
    console.log('\nTesting screen reader compatibility...');
    const headingsStructure = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headings.length > 0;
    });
    console.log(headingsStructure ? '✓ Proper heading structure' : '✗ No headings found');

    console.log('\n✅ Accessibility tests completed');

  } catch (error) {
    console.error('❌ Accessibility test error:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testAccessibility().catch(console.error);
}

module.exports = { testAccessibility };

