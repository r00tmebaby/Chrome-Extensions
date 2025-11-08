#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (!['chrome', 'firefox'].includes(target)) {
  console.error('Usage: node scripts/build.js <chrome|firefox>');
  process.exit(1);
}

const root = process.cwd();
const buildDir = path.join(root, 'build', target);
fs.mkdirSync(buildDir, { recursive: true });

// Copy manifest
const manifestSource = path.join(root, `manifest.${target}.json`);
const manifestDest = path.join(buildDir, 'manifest.json');
fs.copyFileSync(manifestSource, manifestDest);

// Recursively copy src
function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyRecursive(path.join(root, 'src'), path.join(buildDir, 'src'));

console.log(`Built ${target} extension to ${buildDir}`);

