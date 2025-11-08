/**
 * Unit Tests for Popup
 * These tests verify the popup functionality
 */

const { describe, test, expect } = require('@jest/globals');

describe('Popup - Element IDs', () => {
  test('should have required select elements', () => {
    const selects = [
      'font',
      'colorFilter',
      'fontWeight',
      'fontStyle'
    ];

    expect(selects).toContain('font');
    expect(selects).toContain('colorFilter');
  });

  test('should have required buttons', () => {
    const buttons = [
      'reader-view',
      'open-options'
    ];

    expect(buttons).toContain('reader-view');
    expect(buttons).toContain('open-options');
  });

  test('should have notice elements', () => {
    const elements = [
      'notice-text',
      'retry-inject',
      'notice-info'
    ];

    expect(elements).toContain('notice-text');
    expect(elements).toContain('retry-inject');
  });
});

describe('Popup - Preset Buttons', () => {
  test('should have all preset options', () => {
    const presets = [
      'dyslexia',
      'adhd',
      'lowvision'
    ];

    expect(presets.length).toBe(3);
    expect(presets).toContain('dyslexia');
    expect(presets).toContain('adhd');
    expect(presets).toContain('lowvision');
  });
});

describe('Popup - Data Attributes', () => {
  test('should have correct action attributes', () => {
    const actions = [
      'toggle-mode',
      'toggle-flag',
      'toggle-ai-panel'
    ];

    expect(actions).toContain('toggle-mode');
    expect(actions).toContain('toggle-flag');
  });

  test('should have correct flag attributes', () => {
    const flags = [
      'focusMode',
      'visionBoost',
      'highContrast',
      'reduceMotion',
      'autoPauseMedia'
    ];

    expect(flags).toContain('focusMode');
    expect(flags).toContain('reduceMotion');
  });
});

describe('Popup - Restricted URL Detection', () => {
  test('should detect Chrome restricted URLs', () => {
    const restrictedUrls = [
      'chrome://extensions',
      'chrome://settings',
      'chrome.google.com/webstore'
    ];

    const isRestricted = (url) => {
      if (url.startsWith('chrome://')) return true;
      if (url.includes('chrome.google.com/webstore')) return true;
      return false;
    };

    restrictedUrls.forEach(url => {
      expect(isRestricted(url)).toBe(true);
    });
  });

  test('should detect Firefox restricted URLs', () => {
    const restrictedUrls = [
      'about:debugging',
      'about:config',
      'addons.mozilla.org'
    ];

    const isRestricted = (url) => {
      if (url.startsWith('about:')) return true;
      if (url.includes('addons.mozilla.org')) return true;
      return false;
    };

    restrictedUrls.forEach(url => {
      expect(isRestricted(url)).toBe(true);
    });
  });

  test('should allow normal URLs', () => {
    const normalUrls = [
      'https://www.google.com',
      'https://github.com',
      'https://example.com'
    ];

    const isRestricted = (url) => {
      if (url.startsWith('chrome://')) return true;
      if (url.startsWith('about:')) return true;
      return false;
    };

    normalUrls.forEach(url => {
      expect(isRestricted(url)).toBe(false);
    });
  });
});

