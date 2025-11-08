// Extend background with keyboard command handling and per-domain preference logic.
const api = (typeof browser !== 'undefined') ? browser : (typeof chrome !== 'undefined' ? chrome : {});

function getPrefs(cb){
  (api.storage && api.storage.local ? api.storage.local : api.storage).get(['uae_prefs', 'uae_domain_prefs'], (res) => {
    cb({
      global: res.uae_prefs || {},
      domain: res.uae_domain_prefs || {}
    });
  });
}
function saveGlobal(prefs, cb){
  (api.storage && api.storage.local ? api.storage.local : api.storage).set({ uae_prefs: prefs }, cb);
}
function saveDomainPrefs(domainPrefs, cb){
  (api.storage && api.storage.local ? api.storage.local : api.storage).set({ uae_domain_prefs: domainPrefs }, cb);
}

function mergePrefsForUrl(url, all){
  try {
    const host = new URL(url).hostname;
    const specific = all.domain[host] || {};
    return Object.assign({}, all.global, specific);
  } catch(e){ return all.global; }
}

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
  autoPauseMedia: true,
  largeHitTargets: false,
  underlineLinks: false,
  focusBoost: false
};

if (api.runtime && api.runtime.onInstalled) {
  api.runtime.onInstalled.addListener(() => {
    saveGlobal(defaultPrefs);
    saveDomainPrefs({});
  });
}

// Keyboard commands (Chrome MV3 / Firefox MV2 have commands API)
if (api.commands && api.commands.onCommand) {
  api.commands.onCommand.addListener((command) => {
    // apply toggle to active tab
    api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) return;
      getPrefs((all) => {
        const merged = mergePrefsForUrl(tab.url, all);
        if (command === 'toggle-focus-mode') merged.focusMode = !merged.focusMode;
        if (command === 'toggle-easy-read') merged.mode = merged.mode === 'easy' ? 'manual' : 'easy';
        if (command === 'toggle-vision-boost') merged.visionBoost = !merged.visionBoost;
        saveGlobal(Object.assign({}, all.global, {
          focusMode: merged.focusMode,
          mode: merged.mode,
          visionBoost: merged.visionBoost
        }), () => {
          api.tabs.sendMessage(tab.id, { type: 'APPLY_PREFS', data: merged });
        });
      });
    });
  });
}

// Message router additions
if (api.runtime && api.runtime.onMessage) {
  api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === 'GET_PREFS') {
      getPrefs((all) => {
        const mergedRaw = sender.tab ? mergePrefsForUrl(sender.tab.url, all) : all.global;
        const merged = Object.assign({}, defaultPrefs, mergedRaw);
        sendResponse(merged);
      });
      return true;
    }
    if (msg.type === 'SET_PREFS') {
      const withDefaults = Object.assign({}, defaultPrefs, msg.data);
      saveGlobal(withDefaults, () => sendResponse({ ok: true }));
      return true;
    }
    if (msg.type === 'SET_DOMAIN_PREFS') {
      getPrefs((all) => {
        try {
          const host = new URL(msg.url).hostname;
          all.domain[host] = Object.assign({}, defaultPrefs, msg.data);
          saveDomainPrefs(all.domain, () => sendResponse({ ok: true }));
        } catch(e){ sendResponse({ ok: false, error: e.message }); }
      });
      return true;
    }
    if (msg.type === 'PING') { sendResponse({ pong: true }); }
    if (msg.type === 'GET_PROFILE') {
      (api.storage && api.storage.local ? api.storage.local : api.storage).get(['uae_profile'], (res) => {
        sendResponse(res.uae_profile || {});
      });
      return true;
    }
    if (msg.type === 'SET_PROFILE') {
      (api.storage && api.storage.local ? api.storage.local : api.storage).set({ uae_profile: msg.data }, () => sendResponse({ ok: true }));
      return true;
    }
  });
}
