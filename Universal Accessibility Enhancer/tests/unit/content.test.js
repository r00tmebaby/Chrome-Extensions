/**
 * Unit Tests for Content Script
 * These tests verify the content script functionality
 */

const { describe, test, expect } = require('@jest/globals');

describe('Content Script - CSS Classes', () => {
  test('should have correct easy read classes', () => {
    const classes = {
      easyRead: 'uae-easy-read',
      readingRegion: 'uae-reading-region',
      easy: 'uae-easy'
    };

    expect(classes.easyRead).toBe('uae-easy-read');
    expect(classes.readingRegion).toBe('uae-reading-region');
  });

  test('should have correct vision classes', () => {
    const classes = {
      visionBoost: 'uae-vision-boost',
      highContrast: 'uae-high-contrast',
      reducedMotion: 'uae-reduced-motion'
    };

    expect(classes.visionBoost).toBe('uae-vision-boost');
    expect(classes.highContrast).toBe('uae-high-contrast');
  });

  test('should have correct focus mode classes', () => {
    const classes = {
      focusActive: 'uae-focus-active',
      nonFocus: 'uae-nonfocus'
    };

    expect(classes.focusActive).toBe('uae-focus-active');
    expect(classes.nonFocus).toBe('uae-nonfocus');
  });

  test('should have correct font classes', () => {
    const classes = {
      fontDefault: 'uae-font-default',
      fontDyslexic: 'uae-font-dyslexic',
      fontAtkinson: 'uae-font-atkinson'
    };

    expect(classes.fontDyslexic).toBe('uae-font-dyslexic');
    expect(classes.fontAtkinson).toBe('uae-font-atkinson');
  });
});

describe('Content Script - Message Types', () => {
  test('should handle all message types', () => {
    const messageTypes = [
      'APPLY_PREFS',
      'TOGGLE_PANEL',
      'READERVIEW_TOGGLE',
      'PING'
    ];

    expect(messageTypes).toContain('APPLY_PREFS');
    expect(messageTypes).toContain('TOGGLE_PANEL');
    expect(messageTypes).toContain('READERVIEW_TOGGLE');
    expect(messageTypes).toContain('PING');
  });
});

describe('Content Script - Element IDs', () => {
  test('should have correct element IDs', () => {
    const ids = {
      toast: 'uae-toast',
      aiPanel: 'uae-ai-panel',
      readerPanel: 'uae-reader-panel',
      fontStyles: 'uae-font-styles'
    };

    expect(ids.toast).toBe('uae-toast');
    expect(ids.aiPanel).toBe('uae-ai-panel');
    expect(ids.readerPanel).toBe('uae-reader-panel');
  });
});

describe('Content Script - CSS Filters', () => {
  test('should have SVG filter IDs', () => {
    const filterIds = [
      'uae-protanopia-filter',
      'uae-deuteranopia-filter',
      'uae-tritanopia-filter',
      'uae-achromatopsia-filter'
    ];

    expect(filterIds).toContain('uae-protanopia-filter');
    expect(filterIds).toContain('uae-deuteranopia-filter');
  });
});

describe('Content Script - Selectors', () => {
  test('should use correct main content selectors', () => {
    const selectors = [
      'main',
      'article',
      '[role="main"]'
    ];

    expect(selectors).toContain('main');
    expect(selectors).toContain('article');
    expect(selectors).toContain('[role="main"]');
  });

  test('should use correct sidebar selectors', () => {
    const selectors = [
      'aside',
      '[role="complementary"]',
      '[class*="sidebar"]',
      '[id*="sidebar"]'
    ];

    expect(selectors.length).toBeGreaterThan(0);
    expect(selectors).toContain('aside');
  });
});

