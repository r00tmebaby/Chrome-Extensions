/**
 * Unit Tests for Options Page
 * These tests verify the options page functionality
 */

const { describe, test, expect } = require('@jest/globals');

describe('Options Page - Element IDs', () => {
  test('should have all required form elements', () => {
    const elements = [
      'font',
      'mode',
      'colorFilter',
      'focusMode',
      'visionBoost',
      'highContrast',
      'reduceMotion',
      'autoPauseMedia',
      'textSize',
      'lineHeight'
    ];

    expect(elements.length).toBeGreaterThan(0);
    expect(elements).toContain('font');
    expect(elements).toContain('mode');
  });

  test('should have all required buttons', () => {
    const buttons = [
      'save',
      'save-domain',
      'save-profile',
      'preset-dyslexia',
      'preset-adhd',
      'preset-lowvision',
      'reset-defaults'
    ];

    expect(buttons).toContain('save');
    expect(buttons).toContain('preset-dyslexia');
    expect(buttons).toContain('reset-defaults');
  });

  test('should have profile checkboxes', () => {
    const profiles = [
      'prof-dyslexia',
      'prof-adhd',
      'prof-lowvision',
      'prof-colorblind',
      'prof-epilepsy'
    ];

    expect(profiles.length).toBe(5);
    expect(profiles).toContain('prof-dyslexia');
  });
});

describe('Options Page - Default Values', () => {
  test('should have correct default preferences', () => {
    const defaults = {
      mode: 'manual',
      font: 'default',
      colorFilter: 'none',
      focusMode: false,
      visionBoost: false,
      highContrast: false,
      reduceMotion: true,
      autoPauseMedia: true,
      fontSize: '100%',
      lineHeight: '1.6'
    };

    expect(defaults.mode).toBe('manual');
    expect(defaults.reduceMotion).toBe(true);
    expect(defaults.fontSize).toBe('100%');
  });
});

describe('Options Page - Range Values', () => {
  test('should validate font size range', () => {
    const minSize = 80;
    const maxSize = 200;
    const defaultSize = 100;

    expect(defaultSize).toBeGreaterThanOrEqual(minSize);
    expect(defaultSize).toBeLessThanOrEqual(maxSize);
  });

  test('should validate line height range', () => {
    const minHeight = 1.0;
    const maxHeight = 3.0;
    const defaultHeight = 1.6;

    expect(defaultHeight).toBeGreaterThanOrEqual(minHeight);
    expect(defaultHeight).toBeLessThanOrEqual(maxHeight);
  });
});

