(function() {
  const api = (typeof uaeApi !== 'undefined') ? uaeApi : (typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {}));

  document.addEventListener('DOMContentLoaded', () => {
    const noticeText = document.getElementById('notice-text');
    const retryBtn = document.getElementById('retry-inject');
    if (retryBtn) retryBtn.style.display='none';

    const fontSelect = document.getElementById('font');
    const colorFilterSelect = document.getElementById('colorFilter');
    const fontWeightSelect = document.getElementById('fontWeight');
    const fontStyleSelect = document.getElementById('fontStyle');
    const optionsLink = document.getElementById('open-options');

    if (!fontSelect || !colorFilterSelect) {
      console.warn('UAE popup: required selects missing');
      return;
    }

    let prefs = {
      mode: 'manual',
      font: 'default',
      colorFilter: 'none',
      fontWeight: 'normal',
      fontStyle: 'normal'
    };

    function setNotice(text, tip = '') {
      if (noticeText) noticeText.textContent = text;
      const info = document.getElementById('notice-info');
      if (info) info.title = tip || '';
    }

    function showNotice(text) {
      if (noticeText) noticeText.textContent = text;
    }

    function isRestrictedUrl(url) {
      try {
        const u = new URL(url);
        const proto = u.protocol;
        const host = u.hostname;
        const path = u.pathname || '';
        if (proto !== 'http:' && proto !== 'https:') {
          return {restricted:true, tip:'Browser internal pages cannot be modified.'};
        }
        if (host === 'chrome.google.com' && path.startsWith('/webstore')) {
          return {restricted:true, tip:'Chrome Web Store cannot be modified.'};
        }
        if (host === 'microsoftedge.microsoft.com' && path.startsWith('/addons')) {
          return {restricted:true, tip:'Edge Add-ons cannot be modified.'};
        }
        if (host === 'addons.mozilla.org') {
          return {restricted:true, tip:'Mozilla Add-ons cannot be modified.'};
        }
        return {restricted:false};
      } catch(e) {
        return {restricted:true, tip:'Invalid URL.'};
      }
    }

    function safeSendToActive(msg) {
      api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs?.[0];
        if (!tab) return;
        const res = isRestrictedUrl(tab.url || '');
        if (res.restricted) {
          setNotice('Restricted page.', res.tip);
          return;
        }
        api.tabs.sendMessage(tab.id, msg, () => {
          if (api.runtime.lastError) {
            console.log('UAE: Message sent (page may still be loading)');
          }
        });
      });
    }

    function applyToPage() {
      safeSendToActive({ type:'APPLY_PREFS', data: prefs });
    }

    function persist(updateOnly=false) {
      api.runtime.sendMessage({ type: 'SET_PREFS', data: prefs }, () => {
        if (!updateOnly) applyToPage();
      });
    }

    function refreshUI() {
      fontSelect.value = prefs.font || 'default';
      colorFilterSelect.value = prefs.colorFilter || 'none';
      if (fontWeightSelect) fontWeightSelect.value = prefs.fontWeight || 'normal';
      if (fontStyleSelect) fontStyleSelect.value = prefs.fontStyle || 'normal';
    }

    function getFontOptions() {
      try {
        return Array.isArray(window.uaeFontOptions) ? window.uaeFontOptions : [{id:'default', name:'Default'}];
      } catch(e) {
        return [{id:'default', name:'Default'}];
      }
    }

    function populateFonts() {
      const fonts = getFontOptions();
      fontSelect.innerHTML = '';
      fonts.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        fontSelect.appendChild(opt);
      });
    }

    populateFonts();

    // Fetch prefs immediately on popup open
    api.runtime.sendMessage({ type: 'GET_PREFS' }, (data) => {
      if (data) prefs = Object.assign(prefs, data);
      refreshUI();
      setNotice('Ready');
    });

    // Mode buttons
    document.querySelectorAll('button[data-action="toggle-mode"]').forEach(btn => {
      btn.addEventListener('click', () => {
        prefs.mode = btn.dataset.mode;
        persist();
      });
    });

    // Flag buttons
    document.querySelectorAll('button[data-action="toggle-flag"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const flag = btn.dataset.flag;
        prefs[flag] = !prefs[flag];
        persist();
        showNotice(flag + ' toggled');
      });
    });

    fontSelect.addEventListener('change', () => {
      prefs.font = fontSelect.value;
      persist();
    });

    colorFilterSelect.addEventListener('change', () => {
      prefs.colorFilter = colorFilterSelect.value;
      persist();
    });

    if (fontWeightSelect) {
      fontWeightSelect.addEventListener('change', () => {
        prefs.fontWeight = fontWeightSelect.value;
        persist();
      });
    }

    if (fontStyleSelect) {
      fontStyleSelect.addEventListener('change', () => {
        prefs.fontStyle = fontStyleSelect.value;
        persist();
      });
    }

    const aiBtn = document.querySelector('button[data-action="toggle-ai-panel"]');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => {
        safeSendToActive({ type: 'TOGGLE_PANEL' });
      });
    }

    if (optionsLink) {
      optionsLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (api.runtime.openOptionsPage) api.runtime.openOptionsPage();
      });
    }

    function applyPreset(p) {
      if (p==='dyslexia') {
        prefs.mode='easy';
        prefs.font='dyslexic';
        prefs.reduceMotion=true;
        prefs.focusMode=false;
      }
      if (p==='adhd') {
        prefs.focusMode=true;
        prefs.reduceMotion=true;
        prefs.autoPauseMedia=true;
        prefs.mode='manual';
      }
      if (p==='lowvision') {
        prefs.mode='easy';
        prefs.visionBoost=true;
        prefs.highContrast=true;
        prefs.font='verdana';
      }
      persist();
      refreshUI();
    }

    document.querySelectorAll('button[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        applyPreset(btn.dataset.preset);
        showNotice(btn.dataset.preset + ' preset applied');
      });
    });

    const readerBtn = document.getElementById('reader-view');
    if (readerBtn) {
      readerBtn.addEventListener('click', () => {
        safeSendToActive({ type:'READERVIEW_TOGGLE' });
      });
    }

    window.addEventListener('error', (ev) => {
      console.warn('UAE popup error:', ev.error || ev.message);
    });
  });
})();

