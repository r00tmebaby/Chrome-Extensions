#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const buildRoot = path.join(root, 'build');
if (!fs.existsSync(buildRoot)) fs.mkdirSync(buildRoot);
['chrome', 'firefox'].forEach(dir => {
  const p = path.join(buildRoot, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p);
});
console.log('Prepared build directories');

