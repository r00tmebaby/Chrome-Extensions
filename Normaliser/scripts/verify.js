/**
 * Manifest Verification Script
 * Validates manifest.json for Chrome Web Store requirements
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Normaliser extension...\n');

let hasErrors = false;

// 1. Check manifest.json exists and is valid JSON
const manifestPath = path.join(__dirname, '..', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ manifest.json not found');
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('✓ manifest.json is valid JSON');
} catch (err) {
  console.error('❌ manifest.json is invalid JSON:', err.message);
  process.exit(1);
}

// 2. Check required fields
const requiredFields = ['manifest_version', 'name', 'version', 'action'];
requiredFields.forEach(field => {
  if (!manifest[field]) {
    console.error(`❌ Missing required field: ${field}`);
    hasErrors = true;
  } else {
    console.log(`✓ Has required field: ${field}`);
  }
});

// 3. Check manifest version is 3
if (manifest.manifest_version !== 3) {
  console.error('❌ manifest_version must be 3 for modern Chrome extensions');
  hasErrors = true;
} else {
  console.log('✓ Using Manifest V3');
}

// 4. Check permissions
if (manifest.permissions) {
  console.log(`✓ Permissions: ${manifest.permissions.join(', ')}`);

  // Warn about host_permissions
  if (manifest.host_permissions && manifest.host_permissions.length > 0) {
    console.warn('⚠️  WARNING: host_permissions may trigger in-depth review on Chrome Web Store');
    console.warn('   Current host_permissions:', manifest.host_permissions.join(', '));
  } else {
    console.log('✓ No host_permissions (good for faster review)');
  }
}

// 5. Check required files exist
const requiredFiles = ['popup.html', 'popup.js', 'content.js'];
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Required file missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✓ Found required file: ${file}`);
  }
});

// 6. Check icon
if (manifest.action && manifest.action.default_icon) {
  let iconPath;
  // Handle both string and object icon paths
  if (typeof manifest.action.default_icon === 'string') {
    iconPath = manifest.action.default_icon;
  } else if (typeof manifest.action.default_icon === 'object') {
    // Get any icon size
    iconPath = manifest.action.default_icon['16'] ||
               manifest.action.default_icon['48'] ||
               manifest.action.default_icon['128'];
  }

  if (iconPath) {
    const fullPath = path.join(__dirname, '..', iconPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Icon file not found: ${iconPath}`);
    } else {
      console.log(`✓ Icon exists: ${iconPath}`);
    }
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.error('❌ Verification failed with errors');
  process.exit(1);
} else {
  console.log('✅ All checks passed!');
  console.log('\nExtension details:');
  console.log(`  Name: ${manifest.name}`);
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Description: ${manifest.description || 'N/A'}`);
  process.exit(0);
}

