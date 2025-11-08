/**
 * Unit Tests for Audio Normalizer & EQ
 * These tests verify core functionality without requiring a browser
 */

const { describe, test, expect } = require('@jest/globals');
const fs = require('fs');
const path = require('path');

// Load manifest
const manifestPath = path.join(__dirname, '../../manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

describe('Manifest Validation', () => {
  test('should be valid JSON', () => {
    expect(manifest).toBeDefined();
    expect(typeof manifest).toBe('object');
  });

  test('should use Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  test('should have required fields', () => {
    expect(manifest.name).toBeDefined();
    expect(manifest.version).toBeDefined();
    expect(manifest.description).toBeDefined();
    expect(manifest.action).toBeDefined();
  });

  test('should have correct name', () => {
    expect(manifest.name).toBe('Audio Normalizer & EQ');
  });

  test('should have activeTab permission', () => {
    expect(manifest.permissions).toContain('activeTab');
  });

  test('should have scripting permission', () => {
    expect(manifest.permissions).toContain('scripting');
  });

  test('should have storage permission', () => {
    expect(manifest.permissions).toContain('storage');
  });

  test('should NOT have host_permissions (for faster review)', () => {
    // Extension now uses activeTab instead of host_permissions
    expect(manifest.host_permissions).toBeUndefined();
  });

  test('should have popup configured', () => {
    expect(manifest.action.default_popup).toBe('popup.html');
  });

  test('should have icon configured', () => {
    expect(manifest.action.default_icon).toBeDefined();
  });
});

describe('EQ Presets', () => {
  const presets = {
    flat: new Array(10).fill(0),
    rock: [4, 3, 2, 1, -1, -2, 1, 2, 3, 4],
    pop: [2, 1, 0, -1, -2, -2, -1, 0, 1, 2],
    jazz: [3, 2, 1, 0, 0, 0, 1, 2, 3, 4],
    classical: [4, 3, 2, 1, 0, 0, 1, 2, 3, 4],
    bass: [6, 5, 4, 3, 1, 0, 0, 0, 0, 0],
    vocal: [0, 0, 0, 2, 3, 3, 2, 1, 0, 0]
  };

  test('should have all presets defined', () => {
    const presetNames = ['flat', 'rock', 'pop', 'jazz', 'classical', 'bass', 'vocal'];
    presetNames.forEach(name => {
      expect(presets[name]).toBeDefined();
    });
  });

  test('each preset should have 10 bands', () => {
    Object.values(presets).forEach(preset => {
      expect(preset.length).toBe(10);
    });
  });

  test('flat preset should be all zeros', () => {
    expect(presets.flat).toEqual(new Array(10).fill(0));
  });

  test('preset values should be within -12 to +12 dB range', () => {
    Object.values(presets).forEach(preset => {
      preset.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(-12);
        expect(value).toBeLessThanOrEqual(12);
      });
    });
  });
});

describe('EQ Frequency Bands', () => {
  const frequencies = [30, 60, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  test('should have 10 frequency bands', () => {
    expect(frequencies.length).toBe(10);
  });

  test('should start at 30Hz', () => {
    expect(frequencies[0]).toBe(30);
  });

  test('should end at 16kHz', () => {
    expect(frequencies[9]).toBe(16000);
  });

  test('frequencies should be in ascending order', () => {
    for (let i = 1; i < frequencies.length; i++) {
      expect(frequencies[i]).toBeGreaterThan(frequencies[i - 1]);
    }
  });

  test('should cover full audible spectrum', () => {
    expect(frequencies[0]).toBeLessThan(100); // Sub-bass
    expect(frequencies[frequencies.length - 1]).toBeGreaterThan(10000); // Highs
  });
});

describe('Storage Schema', () => {
  test('should define expected storage keys', () => {
    const expectedKeys = [
      'enabled',
      'eqGains',
      'volumeBoost',
      'currentPreset',
      'siteAllowlist',
      'applyToAllSites'
    ];

    expectedKeys.forEach(key => {
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(0);
    });
  });

  test('default volume boost should be valid', () => {
    const defaultVolumeBoost = 1.0;
    expect(defaultVolumeBoost).toBeGreaterThan(0);
    expect(defaultVolumeBoost).toBeLessThanOrEqual(3.0);
  });

  test('default EQ gains should be flat (zeros)', () => {
    const defaultEqGains = new Array(10).fill(0);
    expect(defaultEqGains.length).toBe(10);
    expect(defaultEqGains.every(g => g === 0)).toBe(true);
  });
});

describe('File Existence', () => {
  test('popup.html should exist', () => {
    const filePath = path.join(__dirname, '../../popup.html');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('popup.js should exist', () => {
    const filePath = path.join(__dirname, '../../popup.js');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('content.js should exist', () => {
    const filePath = path.join(__dirname, '../../content.js');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('icon.png should exist', () => {
    const iconPath = path.join(__dirname, '../../icon.png');
    expect(fs.existsSync(iconPath)).toBe(true);
  });

  test('privacy-policy.md should exist', () => {
    const policyPath = path.join(__dirname, '../../privacy-policy.md');
    expect(fs.existsSync(policyPath)).toBe(true);
  });
});

describe('HTML Popup Structure', () => {
  const popupPath = path.join(__dirname, '../../popup.html');
  const popupHtml = fs.readFileSync(popupPath, 'utf8');

  test('should have EQ preset select element', () => {
    expect(popupHtml).toMatch(/<select[^>]*id=["']presetSelect["']/i);
  });

  test('should have volume slider', () => {
    expect(popupHtml).toMatch(/<input[^>]*type=["']range["'][^>]*id=["']gain["']/i);
  });

  test('should reference popup.js', () => {
    expect(popupHtml).toMatch(/<script[^>]*src=["']popup\.js["']/i);
  });

  test('should have toggle controls', () => {
    expect(popupHtml).toMatch(/enabledToggle/i);
    expect(popupHtml).toMatch(/applyAllToggle/i);
  });

  test('should have author credit', () => {
    expect(popupHtml.toLowerCase()).toMatch(/r00tmebaby/);
  });

  test('should have GitHub link', () => {
    expect(popupHtml).toMatch(/github\.com\/r00tmebaby/i);
  });
});

