// Lightweight sentence ranking summarizer (no external APIs)
export function summarize(text, sentenceCount = 5) {
  if (!text) return '';
  // Split into sentences (basic)
  const sentences = text
    .replace(/\s+/g, ' ')
    .match(/[^.!?]+[.!?]/g) || [text];
  const freq = Object.create(null);
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const maxFreq = Math.max(1, ...Object.values(freq));
  const scored = sentences.map((s, i) => {
    const sWords = s.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let score = 0;
    sWords.forEach(w => { score += (freq[w] || 0) / maxFreq; });
    // length penalty for very long sentences
    const len = sWords.length;
    if (len > 30) score *= 0.7;
    return { i, s: s.trim(), score };
  });
  scored.sort((a,b) => b.score - a.score);
  const top = scored.slice(0, sentenceCount).sort((a,b) => a.i - b.i).map(o => o.s);
  return top.join(' ');
}

export function extractMainText() {
  const main = document.querySelector('article, main, [role="main"]') || document.body;
  const paras = Array.from(main.querySelectorAll('p'))
    .filter(p => p.textContent.trim().length > 60)
    .map(p => p.textContent.trim());
  return paras.join(' ');
}

