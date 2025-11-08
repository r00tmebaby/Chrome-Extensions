#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const requiredChrome = [
  'manifest.json',
  'src/popup/popup.html',
  'src/content/content.js'
];
const requiredFirefox = requiredChrome;

function check(target, required) {
  const base = path.join(process.cwd(), 'build', target);
  let ok = true;
  for (const rel of required) {
    const full = path.join(base, rel);
    if (!fs.existsSync(full)) {
      console.error(`[${target}] Missing: ${rel}`);
      ok = false;
    }
  }
  if (ok) console.log(`[${target}] OK (${required.length} files verified)`);
  return ok;
}

const chromeOk = check('chrome', requiredChrome);
const firefoxOk = check('firefox', requiredFirefox);
if (!chromeOk || !firefoxOk) {
  process.exit(1);
}

