const api = (typeof uaeApi !== 'undefined') ? uaeApi : (typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {}));

const fontSelect = document.getElementById('font');
const modeSelect = document.getElementById('mode');
const colorFilterSelect = document.getElementById('colorFilter');
const focusModeCheckbox = document.getElementById('focusMode');
const visionBoostCheckbox = document.getElementById('visionBoost');
const highContrastCheckbox = document.getElementById('highContrast');
const reduceMotionCheckbox = document.getElementById('reduceMotion');
const autoPauseMediaCheckbox = document.getElementById('autoPauseMedia');
const saveBtn = document.getElementById('save');
const saveDomainBtn = document.getElementById('save-domain');
const saveProfileBtn = document.getElementById('save-profile');
const profDys = document.getElementById('prof-dyslexia');
const profAdhd = document.getElementById('prof-adhd');
const profLowVision = document.getElementById('prof-lowvision');
const profColorBlind = document.getElementById('prof-colorblind');
const profEpilepsy = document.getElementById('prof-epilepsy');
const ttsOnCheckbox = document.getElementById('ttsOn');
const presetDyslexiaBtn = document.getElementById('preset-dyslexia');
const presetAdhdBtn = document.getElementById('preset-adhd');
const presetLowVisionBtn = document.getElementById('preset-lowvision');
const resetDefaultsBtn = document.getElementById('reset-defaults');
const textSizeRange = document.getElementById('textSize');
const textSizeValue = document.getElementById('textSizeValue');
const lineHeightRange = document.getElementById('lineHeight');
const lineHeightValue = document.getElementById('lineHeightValue');
const largeHitTargetsCheckbox = document.getElementById('largeHitTargets');
const underlineLinksCheckbox = document.getElementById('underlineLinks');
const focusBoostCheckbox = document.getElementById('focusBoost');

let currentPrefs = {};

function getFontOptions(){
  try { return Array.isArray(window.uaeFontOptions) ? window.uaeFontOptions : [
    { id: 'default', name: 'Default' },
    { id: 'dyslexic', name: 'OpenDyslexic' },
    { id: 'atkinson', name: 'Atkinson Hyperlegible' },
    { id: 'large', name: 'Large Font Size' }
  ]; } catch(e){ return [
    { id: 'default', name: 'Default' },
    { id: 'dyslexic', name: 'OpenDyslexic' },
    { id: 'atkinson', name: 'Atkinson Hyperlegible' },
    { id: 'large', name: 'Large Font Size' }
  ]; }
}

function populateFonts() {
  try {
    const fonts = getFontOptions();
    fontSelect.innerHTML = '';
    fonts.forEach(font => {
      const option = document.createElement('option');
      option.value = font.id;
      option.textContent = font.name;
      fontSelect.appendChild(option);
    });
  } catch (err) {
    console.warn('UAE options: populateFonts failed', err);
  }
}

function applyPreset(preset){
  if (preset === 'dyslexia') {
    modeSelect.value = 'easy';
    fontSelect.value = 'dyslexic';
    reduceMotionCheckbox.checked = true;
    focusModeCheckbox.checked = false;
    visionBoostCheckbox.checked = false;
    highContrastCheckbox.checked = false;
    textSizeRange.value = 110; textSizeValue.textContent = '110%';
    lineHeightRange.value = 20; lineHeightValue.textContent = '2.0';
  } else if (preset === 'adhd') {
    modeSelect.value = 'manual';
    focusModeCheckbox.checked = true;
    reduceMotionCheckbox.checked = true;
    autoPauseMediaCheckbox.checked = true;
    fontSelect.value = 'system-ui';
    textSizeRange.value = 100; textSizeValue.textContent = '100%';
    lineHeightRange.value = 18; lineHeightValue.textContent = '1.8';
  } else if (preset === 'lowvision') {
    modeSelect.value = 'easy';
    visionBoostCheckbox.checked = true;
    highContrastCheckbox.checked = true;
    fontSelect.value = 'verdana';
    textSizeRange.value = 140; textSizeValue.textContent = '140%';
    lineHeightRange.value = 22; lineHeightValue.textContent = '2.2';
  }
}

function collectPrefs(){
  return {
    font: fontSelect.value,
    mode: modeSelect.value,
    colorFilter: colorFilterSelect.value,
    focusMode: focusModeCheckbox.checked,
    visionBoost: visionBoostCheckbox.checked,
    highContrast: highContrastCheckbox.checked, // Correctly read the checkbox
    reduceMotion: reduceMotionCheckbox.checked,
    autoPauseMedia: autoPauseMediaCheckbox.checked,
    ttsOn: !!ttsOnCheckbox?.checked,
    fontSize: textSizeRange.value + '%',
    lineHeight: (lineHeightRange.value/10).toFixed(1),
    largeHitTargets: !!largeHitTargetsCheckbox?.checked,
    underlineLinks: !!underlineLinksCheckbox?.checked,
    focusBoost: !!focusBoostCheckbox?.checked,
    // Remove hardcoded legacy values
  };
}

function load() {
  api.runtime.sendMessage({ type: 'GET_PREFS' }, (prefs) => {
    prefs = prefs || {};
    currentPrefs = prefs;
    fontSelect.value = prefs.font || 'default';
    modeSelect.value = prefs.mode || 'manual';
    colorFilterSelect.value = prefs.colorFilter || 'none';
    focusModeCheckbox.checked = !!prefs.focusMode;
    visionBoostCheckbox.checked = !!prefs.visionBoost;
    highContrastCheckbox.checked = !!prefs.highContrast;
    reduceMotionCheckbox.checked = prefs.reduceMotion !== false;
    autoPauseMediaCheckbox.checked = prefs.autoPauseMedia !== false;
    if (ttsOnCheckbox) ttsOnCheckbox.checked = !!prefs.ttsOn;
    if (largeHitTargetsCheckbox) largeHitTargetsCheckbox.checked = !!prefs.largeHitTargets;
    if (underlineLinksCheckbox) underlineLinksCheckbox.checked = !!prefs.underlineLinks;
    if (focusBoostCheckbox) focusBoostCheckbox.checked = !!prefs.focusBoost;
    if (prefs.fontSize) { textSizeRange.value = parseInt(prefs.fontSize); textSizeValue.textContent = prefs.fontSize; }
    if (prefs.lineHeight) { const lh = Math.round(parseFloat(prefs.lineHeight)*10); lineHeightRange.value = lh; lineHeightValue.textContent = prefs.lineHeight; }
  });
}

function loadProfile(){
  api.runtime.sendMessage({ type: 'GET_PROFILE' }, (profile) => {
    profile = profile || {};
    profDys.checked = !!profile.dyslexia;
    profAdhd.checked = !!profile.adhd;
    profLowVision.checked = !!profile.lowVision;
    profColorBlind.checked = !!profile.colorBlindness;
    profEpilepsy.checked = !!profile.epilepsy;
  });
}

// Real-time preview for sliders - apply changes immediately
textSizeRange?.addEventListener('input', () => {
  textSizeValue.textContent = textSizeRange.value + '%';
  // Apply preview to current tab
  const previewPrefs = collectPrefs();
  sendToActiveWithInject({ type: 'APPLY_PREFS', data: previewPrefs });
});

lineHeightRange?.addEventListener('input', () => {
  lineHeightValue.textContent = (lineHeightRange.value/10).toFixed(1);
  // Apply preview to current tab
  const previewPrefs = collectPrefs();
  sendToActiveWithInject({ type: 'APPLY_PREFS', data: previewPrefs });
});

presetDyslexiaBtn?.addEventListener('click', () => {
  applyPreset('dyslexia');
  // Apply preset preview immediately
  const previewPrefs = collectPrefs();
  sendToActiveWithInject({ type: 'APPLY_PREFS', data: previewPrefs });
});

presetAdhdBtn?.addEventListener('click', () => {
  applyPreset('adhd');
  // Apply preset preview immediately
  const previewPrefs = collectPrefs();
  sendToActiveWithInject({ type: 'APPLY_PREFS', data: previewPrefs });
});

presetLowVisionBtn?.addEventListener('click', () => {
  applyPreset('lowvision');
  // Apply preset preview immediately
  const previewPrefs = collectPrefs();
  sendToActiveWithInject({ type: 'APPLY_PREFS', data: previewPrefs });
});

// Real-time preview for all controls
function applyPreview() {
  const previewPrefs = collectPrefs();
  sendToActiveWithInject({ type: 'APPLY_PREFS', data: previewPrefs });
}

// Add change listeners for immediate preview
fontSelect?.addEventListener('change', applyPreview);
modeSelect?.addEventListener('change', applyPreview);
colorFilterSelect?.addEventListener('change', applyPreview);
focusModeCheckbox?.addEventListener('change', applyPreview);
visionBoostCheckbox?.addEventListener('change', applyPreview);
highContrastCheckbox?.addEventListener('change', applyPreview);
reduceMotionCheckbox?.addEventListener('change', applyPreview);
autoPauseMediaCheckbox?.addEventListener('change', applyPreview);
ttsOnCheckbox?.addEventListener('change', applyPreview);
largeHitTargetsCheckbox?.addEventListener('change', applyPreview);
underlineLinksCheckbox?.addEventListener('change', applyPreview);
focusBoostCheckbox?.addEventListener('change', applyPreview);

resetDefaultsBtn?.addEventListener('click', () => {
  const defaultPrefs = {
    mode: 'manual', font: 'default', colorFilter: 'none', focusMode: false, visionBoost: false, highContrast: false, reduceMotion: true, autoPauseMedia: true, ttsOn: false, fontSize: '100%', lineHeight: '1.6', largeHitTargets: false, underlineLinks: false, focusBoost: false
  };
  api.runtime.sendMessage({ type: 'SET_PREFS', data: defaultPrefs }, () => {
    load();
    resetDefaultsBtn.textContent = 'Reset ✔';
    setTimeout(()=> resetDefaultsBtn.textContent = 'Reset to Defaults', 1200);
  });
});

function sendToActiveWithInject(msg){
  if (!api.tabs) return;
  api.tabs.query({ active: true, currentWindow: true }, (tabs)=>{
    const tab = tabs[0]; if (!tab) return;
    api.tabs.sendMessage(tab.id, msg, ()=>{
      if (api.runtime && api.runtime.lastError) {
        if (api.scripting && api.scripting.executeScript) {
          api.scripting.executeScript({ target:{ tabId: tab.id }, files:['src/common/utils.js','src/common/fontConfig.js','src/content/content.js'] }, ()=>{
            api.tabs.sendMessage(tab.id, msg);
          });
        }
      }
    });
  });
}

saveBtn.addEventListener('click', () => {
  const newPrefs = collectPrefs();
  api.runtime.sendMessage({ type: 'SET_PREFS', data: newPrefs }, () => {
    saveBtn.textContent = 'Saved';
    setTimeout(() => (saveBtn.textContent = 'Save Global'), 1000);
    sendToActiveWithInject({ type: 'APPLY_PREFS', data: newPrefs });
  });
});

saveDomainBtn.addEventListener('click', () => {
  if (!api.tabs) return;
  api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;
    const domainPrefs = collectPrefs();
    api.runtime.sendMessage({ type: 'SET_DOMAIN_PREFS', url: tab.url, data: domainPrefs }, (res) => {
      saveDomainBtn.textContent = res && res.ok ? 'Saved for site' : 'Error';
      setTimeout(() => (saveDomainBtn.textContent = 'Save Domain Override'), 1200);
      sendToActiveWithInject({ type: 'APPLY_PREFS', data: domainPrefs });
    });
  });
});

saveProfileBtn.addEventListener('click', () => {
  const profile = {
    dyslexia: profDys.checked,
    adhd: profAdhd.checked,
    lowVision: profLowVision.checked,
    colorBlindness: profColorBlind.checked,
    epilepsy: profEpilepsy.checked
  };
  api.runtime.sendMessage({ type: 'SET_PROFILE', data: profile }, () => {
    saveProfileBtn.textContent = 'Saved';
    setTimeout(() => saveProfileBtn.textContent = 'Save Profile', 1200);
  });
});

window.addEventListener('error', (ev)=> console.warn('UAE options error:', ev.error||ev.message));

populateFonts();
load();
loadProfile();
