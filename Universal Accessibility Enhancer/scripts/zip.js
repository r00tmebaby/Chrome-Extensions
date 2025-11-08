#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const target = process.argv[2];
if (!['chrome', 'firefox'].includes(target)) {
  console.error('Usage: node scripts/zip.js <chrome|firefox>');
  process.exit(1);
}

const root = process.cwd();
const buildDir = path.join(root, 'build', target);
const outZip = path.join(root, `uae-${target}.zip`);

if (!fs.existsSync(buildDir)) {
  console.error('Build directory missing; run build first.');
  process.exit(1);
}

const output = fs.createWriteStream(outZip);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`Created ${outZip} (${archive.pointer()} bytes)`);
});

archive.on('error', err => { throw err; });
archive.pipe(output);
archive.directory(buildDir, false);
archive.finalize();

