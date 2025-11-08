/**
 * Package Script
 * Creates a zip file ready for Chrome Web Store upload
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const EXTENSION_NAME = 'audio-normalizer-eq';
const EXCLUDE_PATTERNS = [
  'node_modules',
  'tests',
  'scripts',
  'package.json',
  'package-lock.json',
  '*.md',
  '.git*',
  'coverage'
];

async function createPackage() {
  console.log('📦 Creating Chrome Web Store package...\n');

  const manifestPath = path.join(__dirname, '..', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const version = manifest.version;

  const zipName = `${EXTENSION_NAME}-v${version}.zip`;
  const zipPath = path.join(__dirname, '..', zipName);

  // Remove old zip if exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
    console.log(`🗑️  Removed old package: ${zipName}`);
  }

  // Create exclude string for zip command
  const excludeArgs = EXCLUDE_PATTERNS.map(p => `-x "${p}/*"`).join(' ');

  // Create zip (Windows compatible)
  const cmd = `powershell Compress-Archive -Path * -DestinationPath ${zipName} -Force`;

  try {
    console.log('Creating zip archive...');
    // await execAsync(cmd, { cwd: path.join(__dirname, '..') });

    // Alternative: list files to include
    const files = [
      'manifest.json',
      'popup.html',
      'popup.js',
      'content.js',
      'icon.png',
      'normaliser.png',
      'privacy-policy.md'
    ];

    const filesToInclude = files.filter(f =>
      fs.existsSync(path.join(__dirname, '..', f))
    );

    const fileList = filesToInclude.join(',');
    const psCmd = `powershell Compress-Archive -Path ${fileList} -DestinationPath ${zipName} -Force`;

    await execAsync(psCmd, { cwd: path.join(__dirname, '..') });

    const stats = fs.statSync(zipPath);
    console.log(`\n✅ Package created successfully!`);
    console.log(`   File: ${zipName}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`\n📤 Ready to upload to Chrome Web Store!`);

  } catch (err) {
    console.error('❌ Failed to create package:', err.message);
    process.exit(1);
  }
}

createPackage();

