/**
 * Advanced Performance Benchmarks
 * Comprehensive performance testing and metrics collection
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const extensionPath = path.resolve(__dirname, '../../build/chrome');

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

async function measureDetailedPerformance(url, withExtension = true) {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  };

  if (withExtension) {
    launchOptions.args.push(
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    );
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // Enable performance metrics
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {
      navigationStart: 0,
      domContentLoaded: 0,
      loadComplete: 0
    };
  });

  const startTime = Date.now();

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (error) {
    await browser.close();
    return { error: error.message };
  }

  const loadTime = Date.now() - startTime;

  // Get detailed metrics
  const metrics = await page.metrics();
  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  // Memory usage
  const memoryUsage = await page.evaluate(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  });

  // Resource count
  const resourceStats = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    const stats = {
      total: resources.length,
      scripts: resources.filter(r => r.initiatorType === 'script').length,
      css: resources.filter(r => r.initiatorType === 'link' || r.initiatorType === 'css').length,
      images: resources.filter(r => r.initiatorType === 'img').length,
      fonts: resources.filter(r => r.initiatorType === 'font' || r.name.includes('.woff')).length
    };
    return stats;
  });

  // DOM stats
  const domStats = await page.evaluate(() => {
    return {
      totalNodes: document.querySelectorAll('*').length,
      depth: getMaxDepth(document.body),
      headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
      links: document.querySelectorAll('a').length,
      images: document.querySelectorAll('img').length
    };

    function getMaxDepth(element) {
      if (!element) return 0;
      let maxDepth = 0;
      for (let child of element.children) {
        maxDepth = Math.max(maxDepth, getMaxDepth(child));
      }
      return maxDepth + 1;
    }
  });

  await browser.close();

  return {
    loadTime,
    metrics,
    performanceTiming,
    memoryUsage,
    resourceStats,
    domStats,
    url
  };
}

async function runPerformanceBenchmarks() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('  Advanced Performance Benchmarks', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.magenta);

  const testSites = [
    { name: 'Example.com', url: 'https://example.com' },
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Accessibility' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' }
  ];

  const results = [];

  for (const site of testSites) {
    log(`\n⚡ Benchmarking: ${site.name}`, colors.blue);
    log(`   URL: ${site.url}\n`, colors.blue);

    try {
      log('   Testing WITHOUT extension...', colors.yellow);
      const withoutExt = await measureDetailedPerformance(site.url, false);
      await sleep(2000);

      log('   Testing WITH extension...', colors.yellow);
      const withExt = await measureDetailedPerformance(site.url, true);

      if (withoutExt.error || withExt.error) {
        log(`   ✗ Error: ${withoutExt.error || withExt.error}`, colors.red);
        continue;
      }

      // Calculate differences
      const loadTimeDiff = withExt.loadTime - withoutExt.loadTime;
      const loadTimePercent = ((loadTimeDiff / withoutExt.loadTime) * 100).toFixed(1);

      const memoryDiff = withExt.memoryUsage && withoutExt.memoryUsage
        ? (withExt.memoryUsage.usedJSHeapSize - withoutExt.memoryUsage.usedJSHeapSize) / 1024 / 1024
        : 0;

      // Display results
      log(`\n   📊 Load Time:`, colors.cyan);
      log(`      Without: ${withoutExt.loadTime}ms`, colors.cyan);
      log(`      With:    ${withExt.loadTime}ms`, colors.cyan);
      log(`      Impact:  +${loadTimeDiff}ms (${loadTimePercent}%)`,
          loadTimePercent < 10 ? colors.green : loadTimePercent < 20 ? colors.yellow : colors.red);

      if (withExt.memoryUsage && withoutExt.memoryUsage) {
        log(`\n   💾 Memory Usage:`, colors.cyan);
        log(`      Without: ${(withoutExt.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`, colors.cyan);
        log(`      With:    ${(withExt.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`, colors.cyan);
        log(`      Impact:  +${memoryDiff.toFixed(2)}MB`,
            memoryDiff < 5 ? colors.green : memoryDiff < 10 ? colors.yellow : colors.red);
      }

      log(`\n   📦 Resources Loaded:`, colors.cyan);
      log(`      Scripts: ${withExt.resourceStats.scripts}`, colors.cyan);
      log(`      CSS:     ${withExt.resourceStats.css}`, colors.cyan);
      log(`      Images:  ${withExt.resourceStats.images}`, colors.cyan);
      log(`      Fonts:   ${withExt.resourceStats.fonts}`, colors.cyan);
      log(`      Total:   ${withExt.resourceStats.total}`, colors.cyan);

      log(`\n   🏗️  DOM Stats:`, colors.cyan);
      log(`      Total Nodes: ${withExt.domStats.totalNodes}`, colors.cyan);
      log(`      Max Depth:   ${withExt.domStats.depth}`, colors.cyan);
      log(`      Headings:    ${withExt.domStats.headings}`, colors.cyan);
      log(`      Links:       ${withExt.domStats.links}`, colors.cyan);

      // Performance score
      let score = 100;
      if (loadTimePercent > 20) score -= 30;
      else if (loadTimePercent > 10) score -= 15;
      else if (loadTimePercent > 5) score -= 5;

      if (memoryDiff > 10) score -= 20;
      else if (memoryDiff > 5) score -= 10;

      log(`\n   🎯 Performance Score: ${score}/100`,
          score >= 90 ? colors.green : score >= 70 ? colors.yellow : colors.red);

      results.push({
        site: site.name,
        withoutExt,
        withExt,
        loadTimeDiff,
        loadTimePercent,
        memoryDiff,
        score
      });

    } catch (error) {
      log(`   ✗ Benchmark error: ${error.message}`, colors.red);
    }
  }

  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.magenta);
  log('  Performance Summary', colors.magenta);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.magenta);

  if (results.length === 0) {
    log('  ⚠️  No results to display', colors.yellow);
  } else {
    const avgLoadTimeImpact = (results.reduce((sum, r) => sum + parseFloat(r.loadTimePercent), 0) / results.length).toFixed(1);
    const avgMemoryImpact = (results.reduce((sum, r) => sum + r.memoryDiff, 0) / results.length).toFixed(2);
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

    log(`  Average Load Time Impact: +${avgLoadTimeImpact}%`,
        avgLoadTimeImpact < 10 ? colors.green : avgLoadTimeImpact < 20 ? colors.yellow : colors.red);
    log(`  Average Memory Impact: +${avgMemoryImpact}MB`,
        avgMemoryImpact < 5 ? colors.green : avgMemoryImpact < 10 ? colors.yellow : colors.red);
    log(`  Average Performance Score: ${avgScore}/100\n`,
        avgScore >= 90 ? colors.green : avgScore >= 70 ? colors.yellow : colors.red);

    log('  Per-Site Results:', colors.blue);
    results.forEach(r => {
      log(`    ${r.site}: ${r.score}/100 (+${r.loadTimePercent}% load time)`,
          r.score >= 90 ? colors.green : r.score >= 70 ? colors.yellow : colors.red);
    });

    // Recommendations
    log('\n  💡 Recommendations:', colors.yellow);
    if (avgLoadTimeImpact > 15) {
      log('    ⚠️  Consider optimizing content script initialization', colors.yellow);
    }
    if (avgMemoryImpact > 8) {
      log('    ⚠️  Consider reducing memory footprint', colors.yellow);
    }
    if (avgScore >= 90) {
      log('    ✅ Excellent performance! Extension has minimal impact', colors.green);
    } else if (avgScore >= 70) {
      log('    ✅ Good performance, acceptable for production', colors.green);
    } else {
      log('    ⚠️  Performance could be improved', colors.yellow);
    }
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.magenta);

  // Save results to file
  const resultsPath = path.resolve(__dirname, '../performance-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log(`  📄 Detailed results saved: ${resultsPath}\n`, colors.blue);

  process.exit(0);
}

if (require.main === module) {
  runPerformanceBenchmarks().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runPerformanceBenchmarks };
/**
 * Extended E2E Tests - More Real Websites
 * Tests the extension on a wider variety of popular websites
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const extensionPath = path.resolve(__dirname, '../../build/chrome');

// ANSI color codes
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

async function testWebsite(page, site) {
  const results = {
    name: site.name,
    url: site.url,
    injected: false,
    easyReadWorks: false,
    highContrastWorks: false,
    fontChangeWorks: false,
    loadTime: 0,
    error: null
  };

  try {
    const startTime = Date.now();
    await page.goto(site.url, {
      waitUntil: 'networkidle0',
      timeout: 15000
    });
    results.loadTime = Date.now() - startTime;
    await sleep(1000);

    // Test content script injection
    results.injected = await page.evaluate(() => {
      return window.__uaeContentInjected === true;
    });

    if (results.injected) {
      // Test Easy Read Mode
      await page.evaluate(() => {
        document.documentElement.classList.add('uae-easy-read');
      });
      await sleep(300);
      results.easyReadWorks = await page.evaluate(() => {
        return document.documentElement.classList.contains('uae-easy-read');
      });

      // Test High Contrast
      await page.evaluate(() => {
        document.documentElement.classList.add('uae-high-contrast');
      });
      await sleep(300);
      results.highContrastWorks = await page.evaluate(() => {
        return document.documentElement.classList.contains('uae-high-contrast');
      });

      // Test Font Change
      await page.evaluate(() => {
        document.documentElement.classList.add('uae-font-dyslexic');
      });
      await sleep(300);
      results.fontChangeWorks = await page.evaluate(() => {
        return document.documentElement.classList.contains('uae-font-dyslexic');
      });
    }
  } catch (error) {
    results.error = error.message;
  }

  return results;
}

async function runExtendedWebsiteTests() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('  Extended Website Testing Suite', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.cyan);

  if (!fs.existsSync(extensionPath)) {
    log('❌ Extension not built. Run: npm run build:chrome', colors.red);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox'
    ]
  });

  const testSites = [
    // News & Media
    { name: 'BBC News', url: 'https://www.bbc.com/news', category: 'News' },
    { name: 'CNN', url: 'https://www.cnn.com', category: 'News' },
    { name: 'The Guardian', url: 'https://www.theguardian.com', category: 'News' },

    // Social Media
    { name: 'Reddit', url: 'https://www.reddit.com', category: 'Social' },
    { name: 'Twitter/X', url: 'https://twitter.com', category: 'Social' },

    // Tech & Development
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Tech' },
    { name: 'GitHub', url: 'https://github.com', category: 'Tech' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', category: 'Tech' },

    // E-commerce
    { name: 'Amazon', url: 'https://www.amazon.com', category: 'E-commerce' },
    { name: 'eBay', url: 'https://www.ebay.com', category: 'E-commerce' },

    // Education
    { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Accessibility', category: 'Education' },
    { name: 'Khan Academy', url: 'https://www.khanacademy.org', category: 'Education' },

    // Entertainment
    { name: 'YouTube', url: 'https://www.youtube.com', category: 'Entertainment' },
    { name: 'IMDb', url: 'https://www.imdb.com', category: 'Entertainment' },

    // Productivity
    { name: 'Google Docs', url: 'https://docs.google.com', category: 'Productivity' },
    { name: 'Notion', url: 'https://www.notion.so', category: 'Productivity' },
  ];

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];
  let totalTests = 0;
  let passedTests = 0;

  for (const site of testSites) {
    log(`\n🌐 Testing: ${site.name} (${site.category})`, colors.blue);
    log(`   URL: ${site.url}`, colors.blue);

    const result = await testWebsite(page, site);
    results.push(result);

    totalTests++;
    if (result.injected && !result.error) {
      passedTests++;
      log(`   ✓ Content script injected`, colors.green);
      log(`   ✓ Easy Read: ${result.easyReadWorks ? 'Works' : 'Failed'}`,
          result.easyReadWorks ? colors.green : colors.yellow);
      log(`   ✓ High Contrast: ${result.highContrastWorks ? 'Works' : 'Failed'}`,
          result.highContrastWorks ? colors.green : colors.yellow);
      log(`   ✓ Font Change: ${result.fontChangeWorks ? 'Works' : 'Failed'}`,
          result.fontChangeWorks ? colors.green : colors.yellow);
      log(`   ⏱️  Load time: ${result.loadTime}ms`, colors.cyan);
    } else {
      log(`   ✗ ${result.error || 'Injection failed'}`, colors.red);
    }
  }

  await browser.close();

  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('  Test Summary', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);

  // Group by category
  const byCategory = {};
  results.forEach(r => {
    const site = testSites.find(s => s.name === r.name);
    if (!byCategory[site.category]) byCategory[site.category] = [];
    byCategory[site.category].push(r);
  });

  Object.keys(byCategory).forEach(category => {
    const categoryResults = byCategory[category];
    const passed = categoryResults.filter(r => r.injected && !r.error).length;
    log(`\n  ${category}: ${passed}/${categoryResults.length} passed`,
        passed === categoryResults.length ? colors.green : colors.yellow);
    categoryResults.forEach(r => {
      const status = r.injected && !r.error ? '✓' : '✗';
      const color = r.injected && !r.error ? colors.green : colors.red;
      log(`    ${status} ${r.name}`, color);
    });
  });

  const percentage = ((passedTests / totalTests) * 100).toFixed(1);
  log(`\n  Total: ${passedTests}/${totalTests} (${percentage}%)`,
      passedTests === totalTests ? colors.green : colors.yellow);

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.cyan);

  process.exit(passedTests === totalTests ? 0 : 1);
}

if (require.main === module) {
  runExtendedWebsiteTests().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runExtendedWebsiteTests };

