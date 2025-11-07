// Simplified popup.js for Normaliser folder
const slider = document.getElementById("gain");
const label = document.getElementById("gainLabel");
const enabledToggle = document.getElementById("enabledToggle");
const applyAllToggle = document.getElementById("applyAllToggle");
const eqWrapper = document.getElementById("eqWrapper");
const siteInput = document.getElementById("siteInput");
const addSiteBtn = document.getElementById("addSiteBtn");
const siteList = document.getElementById("siteList");
const presetSelect = document.getElementById('presetSelect');
const savePresetBtn = document.getElementById('savePresetBtn');
const deletePresetBtn = document.getElementById('deletePresetBtn');
const refreshModeSel = document.getElementById('refreshMode');
const rawBar = document.getElementById('rawBar');
const rawValue = document.getElementById('rawValue');
const postBar = document.getElementById('postBar');
const postValue = document.getElementById('postValue');
const grLabel = document.getElementById('grLabel');
const meterBar = document.getElementById('meterBar');
const meterValue = document.getElementById('meterValue');

const DEFAULTS = {
  enabled: true,
  applyAll: true,
  allowlist: [],
  gainValue: 1.5,
  eqBands: Array(10).fill(0),
  eqFreqs: [30, 60, 120, 240, 480, 960, 1920, 3840, 7680, 15360],
};

let customPresets = {};
const lastPresetKey = 'lastPresetSelection';

function getActiveTab() { return chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => tabs[0]); }
function saveSync(obj) { return chrome.storage.sync.set(obj); }

let eqUpdateTimer = null;
async function queueEqUpdate() {
  if (eqUpdateTimer) clearTimeout(eqUpdateTimer);
  eqUpdateTimer = setTimeout(async () => {
    const values = [...eqWrapper.querySelectorAll('input.vertical')].map(el=>parseInt(el.value,10)||0);
    const normalized = Array(values.length).fill(0).map((_,i)=>Number(values[i])||0);
    await chrome.storage.local.set({ eqBands: normalized });
    const tab = await getActiveTab();
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: "setEq", bands: normalized });
  }, 120);
}

function refreshPresetOptions() {
  const builtIns = ['custom','reset','rock','pop','jazz','rap','house','bass','treble','vocal','classical','dance'];
  const current = presetSelect.value;
  presetSelect.innerHTML = '';
  for (const k of builtIns) {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k === 'custom' ? 'Preset: Custom' : (k === 'reset' ? 'Preset: Flat' : k.charAt(0).toUpperCase()+k.slice(1));
    presetSelect.appendChild(opt);
  }
  Object.keys(customPresets).forEach(name => {
    const opt = document.createElement('option'); opt.value = `user:${name}`; opt.textContent = `User: ${name}`; presetSelect.appendChild(opt);
  });
  if ([...presetSelect.options].some(o => o.value === current)) presetSelect.value = current;
}

function pattern(base, size){
  const out = Array(size).fill(0);
  for (let i=0;i<size;i++) out[i] = base[i]!==undefined?base[i]:base[base.length-1];
  return out;
}

function applyPresetSelection(value) {
  if (!value) return;
  chrome.storage.sync.set({ [lastPresetKey]: value });
  if (value.startsWith('user:')) {
    const name = value.slice(5);
    const gains = customPresets[name];
    if (Array.isArray(gains)) renderEq(gains);
    queueEqUpdate();
    return;
  }
  if (value === 'custom') return;
  const size = eqWrapper.querySelectorAll('input.vertical').length || 10;
  const PRESETS = {
    flat: Array(size).fill(0),
    rock:   pattern([4,3,2,0,-2,-1,1,3,4,5], size),
    pop:    pattern([0,2,3,3,1,-1,-1,1,2,2], size),
    jazz:   pattern([2,3,2,1,0,1,2,3,2,1], size),
    rap:    pattern([5,4,3,1,-1,-1,1,3,4,5], size),
    house:  pattern([3,4,2,0,-1,0,2,3,4,3], size),
    bass:   pattern([6,5,3,1,0,0,0,-1,-2,-3], size),
    treble: pattern([-3,-2,-1,0,0,0,1,2,3,4], size),
    vocal:  pattern([-2,0,2,3,3,2,1,0,0,-1], size),
    classical: pattern([0,0,0,1,2,2,1,0,0,0], size),
    dance:  pattern([3,3,2,1,0,1,2,3,4,4], size),
  };
  const key = value === 'reset' ? 'flat' : value;
  const gains = PRESETS[key] || PRESETS.flat;
  renderEq(gains);
  queueEqUpdate();
}

function renderEq(bands) {
  eqWrapper.innerHTML = '';
  const size = Array.isArray(bands) ? bands.length : 10;
  eqWrapper.style.gridTemplateColumns = `repeat(${size},1fr)`;
  const used = Array.isArray(bands) ? bands : Array(size).fill(0);
  for (let i=0;i<size;i++) {
    const val = used[i]||0;
    const col = document.createElement('div'); col.className = 'eq-band';
    const labelDiv = document.createElement('div'); labelDiv.className='small'; labelDiv.textContent = DEFAULTS.eqFreqs[i] ? `${DEFAULTS.eqFreqs[i]}Hz` : `B${i+1}`;
    const input = document.createElement('input'); input.type='range'; input.min='-12'; input.max='12'; input.step='1'; input.value=String(val); input.className='vertical';
    const valDiv = document.createElement('div'); valDiv.className='small'; valDiv.textContent = `${val} dB`;
    input.addEventListener('input', () => { valDiv.textContent = `${parseInt(input.value,10)} dB`; queueEqUpdate(); });
    col.appendChild(labelDiv); col.appendChild(input); col.appendChild(valDiv);
    eqWrapper.appendChild(col);
  }
}

function renderAllowlist(list) {
  siteList.innerHTML = "";
  list.forEach((host, idx) => {
    const li = document.createElement("li");
    li.textContent = host;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.addEventListener("click", async () => {
      const newer = list.filter((_, i) => i !== idx);
      await saveSync({ allowlist: newer });
      renderAllowlist(newer);
      const tab = await getActiveTab();
      if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: "updateAllowlist", allowlist: newer });
    });
    li.appendChild(btn);
    siteList.appendChild(li);
  });
}

function extractHost(url) { try { return new URL(url).hostname; } catch { return ""; } }

async function init() {
  const data = await chrome.storage.sync.get(DEFAULTS);
  slider.value = data.gainValue;
  label.textContent = `${Number(data.gainValue).toFixed(1)}x`;
  enabledToggle.checked = !!data.enabled;
  applyAllToggle.checked = !!data.applyAll;
  renderEq(data.eqBands);
  renderAllowlist(Array.isArray(data.allowlist) ? data.allowlist : []);

  slider.addEventListener("input", async (e) => {
    const value = parseFloat(e.target.value);
    label.textContent = `${value.toFixed(1)}x`;
    await saveSync({ gainValue: value });
    const tab = await getActiveTab();
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: "setGain", value });
  });

  enabledToggle.addEventListener("change", async (e) => {
    const value = !!e.target.checked;
    await saveSync({ enabled: value });
    const tab = await getActiveTab();
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: "setEnabled", value });
  });

  applyAllToggle.addEventListener("change", async (e) => {
    const value = !!e.target.checked;
    await saveSync({ applyAll: value });
    const tab = await getActiveTab();
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: "setApplyAll", value });
  });

  addSiteBtn.addEventListener("click", async () => {
    const host = siteInput.value.trim().toLowerCase();
    if (!host) return;
    const store = await chrome.storage.sync.get(DEFAULTS);
    const list = Array.isArray(store.allowlist) ? store.allowlist : [];
    if (list.includes(host)) return;
    const newer = [...list, host];
    await saveSync({ allowlist: newer });
    renderAllowlist(newer);
    siteInput.value = "";
    const tab = await getActiveTab();
    if (tab && tab.id) chrome.tabs.sendMessage(tab.id, { type: "updateAllowlist", allowlist: newer });
  });

  const tab = await getActiveTab();
  const host = extractHost(tab?.url || "");
  siteInput.placeholder = host || "example.com";

  // Load custom presets
  const presetData = await chrome.storage.sync.get({ customPresets: {} });
  customPresets = presetData.customPresets || {};
  refreshPresetOptions();
}

init().catch(() => {});

// Ensure content script is present using activeTab + scripting
(async function ensureInjected(){
  try {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;
    await new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { type: 'ping' }, () => resolve());
    });
  } catch {}
  try {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
  } catch {}
})();

// Presets
presetSelect?.addEventListener('change', (e)=>applyPresetSelection(e.target.value));
savePresetBtn?.addEventListener('click', async () => {
  const name = prompt('Preset name (2-20 chars)');
  if (!name || !/^[\w-]{2,20}$/.test(name)) return;
  const gains = [...eqWrapper.querySelectorAll('input.vertical')].map(el=>parseInt(el.value,10)||0);
  customPresets[name]=gains;
  await chrome.storage.sync.set({ customPresets });
  refreshPresetOptions();
  presetSelect.value = 'user:'+name;
});

deletePresetBtn?.addEventListener('click', async () => {
  const val = presetSelect.value; if (!val.startsWith('user:')) return;
  const name = val.slice(5); if (!customPresets[name]) return;
  if (!confirm('Delete preset '+name+'?')) return;
  delete customPresets[name];
  await chrome.storage.sync.set({ customPresets });
  refreshPresetOptions();
  presetSelect.value='custom';
});

// Restore last preset on open
(async function restoreLastPreset(){
  const data = await chrome.storage.sync.get({ [lastPresetKey]: 'custom' });
  const preset = data[lastPresetKey];
  if (preset && presetSelect) { presetSelect.value = preset; applyPresetSelection(preset); }
})();

// Meter polling
function updateMeterUI(db){
  const norm = Math.max(0, Math.min(1, 1 + db/60));
  meterBar.style.width = Math.round(norm*100)+'%';
  meterValue.textContent = 'Peak: ' + db.toFixed(2) + ' dB';
}

async function pollMeter(){
  const tab = await getActiveTab();
  if (!tab || !tab.id) return setTimeout(pollMeter, 250);
  chrome.tabs.sendMessage(tab.id, { type:'getMeter' }, (res) => {
    if (!chrome.runtime.lastError && res && typeof res.peakDb === 'number') updateMeterUI(res.peakDb);
    setTimeout(pollMeter, 150);
  });
}

pollMeter().catch(()=>{});

(async function initRefresh(){ const data = await chrome.storage.sync.get({ refreshMode:'fast' }); const v=data.refreshMode; meterDelay = v==='eco'?300:100; if (refreshModeSel) refreshModeSel.value=v; })();
refreshModeSel?.addEventListener('change', async (e)=>{ const v=e.target.value; meterDelay = v==='eco'?300:100; await chrome.storage.sync.set({ refreshMode:v }); });

