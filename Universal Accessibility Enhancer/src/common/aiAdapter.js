// AI Adapter interface (local vs remote providers)
// This is a stub; real implementations will plug in local TF.js model or remote API behind opt-in.
export class AIAdapter {
  constructor({ mode = 'local' } = {}) { this.mode = mode; }
  async classifyPage(features) {
    // Local heuristic fallback
    return features;
  }
  async simplify(text) {
    // Local summarizer fallback (invoke summarizer externally)
    return text.slice(0, 800) + (text.length > 800 ? '…' : '');
  }
  async explain(changes) {
    return 'Explanation stub: ' + Object.keys(changes).join(', ');
  }
}

export function createAdapter(config) { return new AIAdapter(config); }
