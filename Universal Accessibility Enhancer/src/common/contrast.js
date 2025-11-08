function parseRGB(str){
  const m = str.match(/rgba?\((\d+),(\d+),(\d+)/); return m? [parseInt(m[1]),parseInt(m[2]),parseInt(m[3])]:[0,0,0]; }
function luminance([r,g,b]){ r/=255; g/=255; b/=255; const a=[r,g,b].map(v=> v<=0.03928? v/12.92: Math.pow((v+0.055)/1.055,2.4)); return a[0]*0.2126+a[1]*0.7152+a[2]*0.0722; }
function contrastRatio(fg,bg){ const L1=luminance(fg)+0.05; const L2=luminance(bg)+0.05; return L1>L2? L1/L2: L2/L1; }

export function scanContrast(root, { threshold = 4.5, max = 5000, batch = 400, onProgress, onComplete } = {}) {
  const elements = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (!el) continue;
    if (elements.length >= max) break;
    if (el.children.length === 0 && el.textContent.trim()) elements.push(el);
  }
  let idx=0, scanned=0, fixed=0;
  function processBatch(){
    const end=Math.min(idx+batch, elements.length);
    for(; idx<end; idx++) {
      const el=elements[idx];
      const style=getComputedStyle(el);
      if (style.visibility==='hidden'|| style.display==='none') continue;
      const fg=parseRGB(style.color);
      // approximate background
      let bgStyle=style.backgroundColor; let anc=el.parentElement; let safety=0;
      while((!bgStyle || bgStyle.startsWith('rgba(0,0,0,0)') || bgStyle==='transparent') && anc && safety++<10) { bgStyle=getComputedStyle(anc).backgroundColor; anc=anc.parentElement; }
      const bg=parseRGB(bgStyle||'rgb(255,255,255)');
      const ratio=contrastRatio(fg,bg);
      scanned++;
      if (ratio < threshold) {
        // Adjust foreground toward better contrast
        let [r,g,b]=fg; const targetBright=luminance(bg)>0.5? -12: 12; let attempts=0;
        while(contrastRatio([r,g,b],bg) < threshold && attempts++<25){ r=Math.min(255,Math.max(0,r+targetBright)); g=Math.min(255,Math.max(0,g+targetBright)); b=Math.min(255,Math.max(0,b+targetBright)); }
        el.style.color = `rgb(${r},${g},${b})`;
        el.dataset.uaeContrastFixed='1';
        fixed++;
      }
    }
    onProgress && onProgress({ scanned, fixed, total: elements.length });
    if (idx < elements.length) requestIdleCallback(processBatch, { timeout: 200 });
    else onComplete && onComplete({ scanned, fixed, total: elements.length });
  }
  requestIdleCallback(processBatch, { timeout: 200 });
  return { total: elements.length };
}
