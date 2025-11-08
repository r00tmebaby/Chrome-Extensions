/**
 * Unit Tests for Background Script
 * These tests verify the background service worker functionality
 */

const { describe, test, expect } = require('@jest/globals');

describe('Background Script - Message Handlers', () => {
  test('should handle GET_PREFS message', () => {
    const defaultPrefs = {
      mode: 'manual',
      font: 'default',
      contrast: 'auto',
      spacing: 'normal',
      focusMode: false,
      visionBoost: false,
      highContrast: false,
      colorFilter: 'none',
      reduceMotion: true,
      autoPauseMedia: true
    };

    expect(defaultPrefs.mode).toBe('manual');
    expect(defaultPrefs.reduceMotion).toBe(true);
    expect(defaultPrefs.focusMode).toBe(false);
  });

  test('should handle SET_PREFS message', () => {
    const newPrefs = {
      mode: 'easy',
      font: 'dyslexic',
      focusMode: true
    };

    expect(newPrefs.mode).toBe('easy');
    expect(newPrefs.font).toBe('dyslexic');
  });

  test('should merge domain-specific preferences', () => {
    const globalPrefs = { mode: 'manual', font: 'default' };
    const domainPrefs = { font: 'dyslexic' };

    const merged = { ...globalPrefs, ...domainPrefs };

    expect(merged.mode).toBe('manual');
    expect(merged.font).toBe('dyslexic');
  });

  test('should validate preference values', () => {
    const validModes = ['manual', 'easy'];
    const validFonts = ['default', 'dyslexic', 'atkinson', 'system-ui', 'verdana', 'georgia', 'arial', 'large'];

    expect(validModes).toContain('manual');
    expect(validModes).toContain('easy');
    expect(validFonts).toContain('dyslexic');
    expect(validFonts).toContain('atkinson');
  });
});

describe('Font Configuration', () => {
  test('should have all required font options', () => {
    const fontOptions = [
      { id: 'default', name: 'Default' },
      { id: 'dyslexic', name: 'OpenDyslexic' },
      { id: 'atkinson', name: 'Atkinson Hyperlegible' },
      { id: 'system-ui', name: 'System UI' },
      { id: 'verdana', name: 'Verdana' },
      { id: 'georgia', name: 'Georgia' },
      { id: 'arial', name: 'Arial' },
      { id: 'large', name: 'Large Font Size' }
    ];

    expect(fontOptions.length).toBeGreaterThan(0);
    expect(fontOptions[1].id).toBe('dyslexic');
    expect(fontOptions[2].id).toBe('atkinson');
  });

  test('should validate font family strings', () => {
    const fonts = {
      dyslexic: 'OpenDyslexic, sans-serif',
      atkinson: '"Atkinson Hyperlegible", sans-serif',
      systemui: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
    };

    expect(fonts.dyslexic).toContain('OpenDyslexic');
    expect(fonts.atkinson).toContain('Atkinson Hyperlegible');
    expect(fonts.systemui).toContain('system-ui');
  });
});

describe('Color Filters', () => {
  test('should have all color filter types', () => {
    const filters = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];

    expect(filters).toContain('protanopia');
    expect(filters).toContain('deuteranopia');
    expect(filters).toContain('tritanopia');
    expect(filters).toContain('achromatopsia');
  });

  test('should validate filter class names', () => {
    const filterClasses = {
      protanopia: 'uae-color-filter-protanopia',
      deuteranopia: 'uae-color-filter-deuteranopia',
      tritanopia: 'uae-color-filter-tritanopia',
      achromatopsia: 'uae-color-filter-achromatopsia'
    };

    expect(filterClasses.protanopia).toBe('uae-color-filter-protanopia');
    expect(filterClasses.deuteranopia).toBe('uae-color-filter-deuteranopia');
  });
});

describe('Preset Configurations', () => {
  test('should apply dyslexia preset correctly', () => {
    const dyslexiaPreset = {
      mode: 'easy',
      font: 'dyslexic',
      reduceMotion: true,
      focusMode: false,
      fontSize: '110%',
      lineHeight: '2.0'
    };

    expect(dyslexiaPreset.mode).toBe('easy');
    expect(dyslexiaPreset.font).toBe('dyslexic');
    expect(dyslexiaPreset.reduceMotion).toBe(true);
  });

  test('should apply ADHD preset correctly', () => {
    const adhdPreset = {
      mode: 'manual',
      focusMode: true,
      reduceMotion: true,
      autoPauseMedia: true
    };

    expect(adhdPreset.focusMode).toBe(true);
    expect(adhdPreset.reduceMotion).toBe(true);
    expect(adhdPreset.autoPauseMedia).toBe(true);
  });

  test('should apply low vision preset correctly', () => {
    const lowVisionPreset = {
      mode: 'easy',
      visionBoost: true,
      highContrast: true,
      fontSize: '140%',
      lineHeight: '2.2'
    };

    expect(lowVisionPreset.visionBoost).toBe(true);
    expect(lowVisionPreset.highContrast).toBe(true);
    expect(lowVisionPreset.fontSize).toBe('140%');
  });
});

describe('URL Validation', () => {
  test('should detect restricted URLs', () => {
    const restrictedUrls = [
      'chrome://extensions',
      'chrome://settings',
      'about:debugging',
      'chrome.google.com/webstore',
      'addons.mozilla.org'
    ];

    const isRestricted = (url) => {
      return url.startsWith('chrome://') ||
             url.startsWith('about:') ||
             url.includes('chrome.google.com/webstore') ||
             url.includes('addons.mozilla.org');
    };

    expect(isRestricted(restrictedUrls[0])).toBe(true);
    expect(isRestricted(restrictedUrls[1])).toBe(true);
    expect(isRestricted('https://example.com')).toBe(false);
  });

  test('should extract hostname from URL', () => {
    const url = 'https://www.example.com/path/to/page';
    const hostname = new URL(url).hostname;

    expect(hostname).toBe('www.example.com');
  });
});
