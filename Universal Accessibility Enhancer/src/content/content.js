(function(){
  if (window.__uaeContentInjected) { return; }
  window.__uaeContentInjected = true;

  const api = (typeof uaeApi !== 'undefined') ? uaeApi : (typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : {}));

  let prefs = null;

  const elFocusOverlay = document.createElement('div');
  elFocusOverlay.className = 'uae-focus-overlay';
  document.documentElement.appendChild(elFocusOverlay);

  const toast = document.createElement('div');
  toast.id = 'uae-toast';
  toast.style.display = 'none';
  document.documentElement.appendChild(toast);

  const aiPanel = document.createElement('div');
  aiPanel.id = 'uae-ai-panel';
  aiPanel.innerHTML = `
    <header><strong>UAE Assistant</strong><button class="close">×</button></header>
    <textarea placeholder="Ask for help (e.g., simplify this page)"></textarea>
    <div class="actions"><button class="run">Suggest</button></div>
    <div class="output"></div>
  `;
  document.documentElement.appendChild(aiPanel);
  aiPanel.querySelector('button.close').onclick = () => aiPanel.style.display = 'none';
  aiPanel.querySelector('button.run').onclick = () => {
    const out = aiPanel.querySelector('.output');
    out.textContent = 'AI features are not enabled. Upgrade will be optional later. (Stub: local heuristics used.)';
  };

  function showToast(text) {
    toast.textContent = text;
    toast.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toast.style.display = 'none'), 1500);
  }

  const colorFilterDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  colorFilterDefs.style.position = 'absolute'; colorFilterDefs.style.height = '0';
  colorFilterDefs.innerHTML = `
    <defs>
      <filter id="uae-protanopia-filter"><feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" /></filter>
      <filter id="uae-deuteranopia-filter"><feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" /></filter>
      <filter id="uae-tritanopia-filter"><feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" /></filter>
      <filter id="uae-achromatopsia-filter"><feColorMatrix type="matrix" values="0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0.299,0.587,0.114,0,0 0,0,0,1,0" /></filter>
    </defs>
  `;
  document.documentElement.appendChild(colorFilterDefs);

  function applyColorFilter(filter) {
    const root = document.documentElement;
    root.classList.remove('uae-color-filter-protanopia','uae-color-filter-deuteranopia','uae-color-filter-tritanopia', 'uae-color-filter-achromatopsia');
    if (filter === 'protanopia') root.classList.add('uae-color-filter-protanopia');
    if (filter === 'deuteranopia') root.classList.add('uae-color-filter-deuteranopia');
    if (filter === 'tritanopia') root.classList.add('uae-color-filter-tritanopia');
    if (filter === 'achromatopsia') root.classList.add('uae-color-filter-achromatopsia');
  }

  function pauseAutoPlayingMedia() {
    document.querySelectorAll('video, audio').forEach(m => {
      if (!m.paused && !m.dataset.uaeUserPlayed) {
        m.pause();
      }
      m.addEventListener('play', () => m.dataset.uaeUserPlayed = '1', { once: true });
    });
    document.querySelectorAll('img[src$=".gif"]').forEach(img => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      try { ctx.drawImage(img, 0, 0, img.width, img.height); img.src = c.toDataURL('image/png'); } catch(e) {}
    });
  }

  function detectFlashing() {
    const style = getComputedStyle(document.documentElement);
    if (style.animationDuration && parseFloat(style.animationDuration) < 0.4) {
      document.documentElement.classList.add('uae-reduced-motion');
    }
  }

  function easyReadSimplify() {
    const main = document.querySelector('main, article, [role="main"]') || document.body;
    document.body.classList.toggle('uae-easy', prefs && prefs.mode === 'easy');
    if (prefs && prefs.mode === 'easy') {
      document.documentElement.classList.add('uae-easy-read');
      main.classList.add('uae-reading-region');
      document.querySelectorAll('aside, [role="complementary"], [class*="sidebar"], [id*="sidebar"], header, footer').forEach(el => {
        if (!main.contains(el)) el.style.opacity = '0.25';
      });
      document.querySelectorAll('[style*="position: sticky"], .sticky, [class*="sticky-"], [class*="-sticky"], .ad, [id*="ad-"], [class*="-ad-"]').forEach(el => {
        if (!main.contains(el)) { el.style.visibility = 'hidden'; el.style.pointerEvents = 'none'; }
      });
    } else {
      document.querySelectorAll('aside, [role="complementary"], [class*="sidebar"], [id*="sidebar"], header, footer').forEach(el => { el.style.opacity = ''; });
      document.querySelectorAll('[style*="position: sticky"], .sticky, [class*="sticky-"], [class*="-sticky"], .ad, [id*="ad-"], [class*="-ad-"]').forEach(el => { el.style.visibility = ''; el.style.pointerEvents = ''; });
    }
  }

  let ttsUtterance = null;
  function ensureTTS(){ if (!('speechSynthesis' in window)) return null; if (!ttsUtterance) ttsUtterance = new SpeechSynthesisUtterance(''); return window.speechSynthesis; }
  function readMainText(){ const synth = ensureTTS(); if (!synth) return; const main = document.querySelector('main, article, [role="main"]') || document.body; const text = Array.from(main.querySelectorAll('p, h1, h2, h3, li')).map(n => n.innerText.trim()).filter(Boolean).join('\n'); if (!text) return; const u = new SpeechSynthesisUtterance(text.slice(0, 8000)); synth.cancel(); synth.speak(u); }
  function stopTTS(){ const synth = ensureTTS(); if (synth) synth.cancel(); }

  function improvedFocusMode() {
    const main = document.querySelector('article, main, [role="main"]') || document.body;
    document.documentElement.classList.toggle('uae-focus-active', !!(prefs && prefs.focusMode));
    if (prefs && prefs.focusMode) {
      Array.from(document.body.children).forEach(ch => {
        if (!main.contains(ch)) ch.classList.add('uae-nonfocus'); else ch.classList.remove('uae-nonfocus');
      });
    } else {
      document.querySelectorAll('.uae-nonfocus').forEach(el => el.classList.remove('uae-nonfocus'));
    }
  }

  function checkCaptionsOnce(){
    if (checkCaptionsOnce._ran) return; checkCaptionsOnce._ran = true;
    const videos = Array.from(document.querySelectorAll('video'));
    if (!videos.length) return;
    const lacking = videos.filter(v => !v.querySelector('track[kind="captions"], track[kind="subtitles"]'));
    if (lacking.length) showToast(`UAE: ${lacking.length} video(s) missing captions`);
  }

  function injectFontStylesheet(){
    if (document.getElementById('uae-font-styles')) return;
    const link = document.createElement('link'); link.id = 'uae-font-styles'; link.rel = 'stylesheet'; link.type = 'text/css'; link.href = api.runtime.getURL('src/content/fonts.css'); document.head.appendChild(link);
  }

  function openReaderView() {
    let panel = document.getElementById('uae-reader-panel');

    if (panel) {
      // Toggle visibility
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        showToast('Reader View opened');
      } else {
        showToast('Reader View closed');
      }
      return;
    }

    // Create reader panel
    panel = document.createElement('div');
    panel.id = 'uae-reader-panel';
    panel.innerHTML = `
      <div class="reader-header">
        <h2>Reader View</h2>
        <button class="reader-close" title="Close Reader View">×</button>
      </div>
      <div class="reader-content"></div>
    `;
    document.body.appendChild(panel);

    // Extract main content
    const main = document.querySelector('article, main, [role="main"]') || document.body;
    const content = panel.querySelector('.reader-content');

    // Extract headings and paragraphs
    const elements = main.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
    if (elements.length > 0) {
      elements.forEach(el => {
        const clone = el.cloneNode(true);
        // Remove scripts and styles from cloned content
        clone.querySelectorAll('script, style').forEach(s => s.remove());
        content.appendChild(clone);
      });
    } else {
      content.innerHTML = '<p>No readable content found on this page.</p>';
    }

    // Close button handler
    panel.querySelector('.reader-close').onclick = () => {
      panel.style.display = 'none';
      showToast('Reader View closed');
    };

    showToast('Reader View opened');
  }

  function applyPrefs() {
    if (!prefs) return;
    console.log('UAE: Applying prefs', prefs); // Debug log
    const root = document.documentElement;
    document.documentElement.style.setProperty('--uae-font-size', prefs.fontSize || '100%');
    document.documentElement.style.setProperty('--uae-line-height', prefs.lineHeight || '1.6');
    document.documentElement.style.setProperty('--uae-letter-spacing', prefs.letterSpacing === 'default' ? '' : prefs.letterSpacing);
    document.documentElement.style.setProperty('--uae-focus-outline', prefs.focusOutline ? '2px solid #00f' : 'none');
    document.documentElement.style.setProperty('--uae-bg-color', prefs.bgColor);
    document.documentElement.style.setProperty('--uae-text-color', prefs.textColor);
    document.documentElement.style.setProperty('--uae-link-color', prefs.linkColor);
    document.documentElement.style.setProperty('--uae-accent-color', prefs.accentColor);
    document.documentElement.style.setProperty('--uae-border-radius', prefs.borderRadius === 'default' ? '' : prefs.borderRadius);
    document.documentElement.style.setProperty('--uae-transition-speed', prefs.transitionSpeed === 'default' ? '' : prefs.transitionSpeed);

    document.documentElement.classList.toggle('uae-high-contrast', !!prefs.highContrast);
    document.documentElement.classList.toggle('uae-reduced-motion', !!prefs.reduceMotion);

    document.documentElement.classList.toggle('uae-font-default', prefs.font === 'default');
    document.documentElement.classList.toggle('uae-font-dyslexic', prefs.font === 'dyslexic');
    document.documentElement.classList.toggle('uae-font-atkinson', prefs.font === 'atkinson');

    if (prefs.font === 'dyslexic' || prefs.font === 'atkinson') {
        injectFontStylesheet();
        root.style.fontFamily = `"${prefs.font === 'dyslexic' ? 'OpenDyslexic' : 'Atkinson Hyperlegible'}", sans-serif`;
    } else if (prefs.font === 'large') {
      root.style.fontFamily = ''; root.style.fontSize = '110%';
    } else {
        root.style.fontFamily = ''; // Reset to default
    }

    root.style.fontWeight = prefs.fontWeight || 'normal';
    root.style.fontStyle = prefs.fontStyle || 'normal';

    root.classList.toggle('uae-vision-boost', !!prefs.visionBoost);
    document.documentElement.classList.toggle('uae-large-hit-targets', !!prefs.largeHitTargets);
    document.documentElement.classList.toggle('uae-underline-links', !!prefs.underlineLinks);
    document.documentElement.classList.toggle('uae-focus-boost', !!prefs.focusBoost);

    applyColorFilter(prefs.colorFilter || 'none');
    if (prefs.autoPauseMedia) pauseAutoPlayingMedia();
    easyReadSimplify();
    improvedFocusMode();
    if (prefs.ttsOn) { readMainText(); } else { stopTTS(); }
  }

  api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === 'APPLY_PREFS') {
      prefs = msg.data;
      applyPrefs();
      sendResponse({ ok: true });
    }
    if (msg.type === 'TOGGLE_PANEL') {
      aiPanel.style.display = aiPanel.style.display === 'none' ? 'block' : 'none';
    }
    if (msg.type === 'READERVIEW_TOGGLE') {
      openReaderView();
    }
    if (msg.type === 'PING') {
      sendResponse({ pong: true });
    }
  });

  // Initialize on load
  api.runtime.sendMessage({ type: 'GET_PREFS' }, (data) => {
    if (data) {
      prefs = data;
      applyPrefs();
      checkCaptionsOnce();
      detectFlashing();
    }
  });
})();
