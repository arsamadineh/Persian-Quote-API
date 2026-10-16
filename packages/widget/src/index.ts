/**
 * <persian-quote> web component.
 *
 * Shadow DOM, RTL Persian quote rendering, CSS variable theming,
 * accessible semantics (<figure>, <blockquote lang="fa" dir="rtl">).
 * Target: < 4 KB gzipped. Zero runtime dependencies.
 */

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: block;
      font-family: var(--pq-font-family, 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, sans-serif);
      --pq-bg: var(--pq-bg, #ffffff);
      --pq-text: var(--pq-text, #1a1a1a);
      --pq-border: var(--pq-border, #e5e5e5);
      --pq-accent: var(--pq-accent, #0f62fe);
      --pq-max-width: var(--pq-max-width, 420px);
    }
    .root {
      max-width: var(--pq-max-width);
      margin: 0 auto;
      padding: 16px;
      background: var(--pq-bg);
      color: var(--pq-text);
      border: 1px solid var(--pq-border);
      border-radius: 8px;
      box-sizing: border-box;
      line-height: 1.7;
      direction: rtl;
      text-align: right;
    }
    .root blockquote {
      margin: 0 0 12px 0;
      padding-right: 16px;
      border-right: 3px solid var(--pq-accent);
      font-size: 1.15rem;
      font-style: normal;
      quotes: none;
    }
    .root .cite {
      font-size: 0.85rem;
      color: var(--pq-text, #1a1a1a);
      opacity: 0.7;
      text-align: right;
      direction: rtl;
    }
    .root .cite .poet {
      font-weight: 600;
    }
    .root .actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .root button {
      background: var(--pq-accent, #0f62fe);
      color: #ffffff;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      direction: rtl;
    }
    .root button:hover {
      opacity: 0.9;
    }
    .root .empty {
      padding: 24px;
      text-align: center;
      opacity: 0.6;
    }
  </style>
  <div class="root" part="root">
    <figure part="figure">
      <blockquote lang="fa" dir="rtl" part="blockquote"></blockquote>
      <figcaption part="cite" class="cite"></figcaption>
    </figure>
    <div class="actions" part="actions">
      <button id="refresh" part="button">جدید</button>
    </div>
    <div class="empty" part="empty" style="display:none;"></div>
  </div>
`;

class PersianQuote extends HTMLElement {
  static get observedAttributes() {
    return ['poem-id', 'poet', 'api-base'];
  }

  #shadow: ShadowRoot;
  #blockquote: HTMLQuoteElement;
  #cite: HTMLElement;
  #refresh: HTMLButtonElement;
  #empty: HTMLElement;
  #apiBase: string;
  #poemId: string | null;
  #poet: string | null;
  #abort: AbortController | null = null;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open', delegatesFocus: false });
    this.#shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#blockquote = this.#shadow.querySelector('blockquote')!;
    this.#cite = this.#shadow.querySelector('.cite')!;
    this.#refresh = this.#shadow.querySelector('#refresh')!;
    this.#empty = this.#shadow.querySelector('.empty')!;
    this.#apiBase = this.getAttribute('api-base') || '';
    this.#poemId = this.getAttribute('poem-id') || null;
    this.#poet = this.getAttribute('poet') || null;
    this.#refresh.addEventListener('click', () => this.#load());
  }

  connectedCallback(): void {
    this.#load();
  }

  attributeChangedCallback(name: string, old: string, value: string): void {
    if (name === 'api-base') this.#apiBase = value;
    else if (name === 'poem-id') this.#poemId = value || null;
    else if (name === 'poet') this.#poet = value || null;
    if (name !== 'api-base') this.#load();
  }

  async #load(): Promise<void> {
    this.#abort?.abort();
    this.#abort = new AbortController();
    this.#empty.style.display = 'none';
    this.#blockquote.textContent = '';
    this.#cite.textContent = '';

    try {
      let url: string;
      if (this.#poemId) {
        url = `${this.#apiBase}/v1/works/${encodeURIComponent(this.#poemId)}`;
      } else if (this.#poet) {
        url = `${this.#apiBase}/v1/works?poet=${encodeURIComponent(this.#poet)}&limit=1`;
      } else {
        url = `${this.#apiBase}/v1/works/random`;
      }
      const res = await fetch(url, { signal: this.#abort.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as any;
      const poem = data.poem ?? data.items?.[0] ?? data;
      this.#render(poem);
    } catch (err) {
      this.#empty.style.display = 'block';
      this.#empty.textContent = 'امکان بارگذاری شعر پیدا نشد.';
    }
  }

  #render(poem: any): void {
    const lines = Array.isArray(poem.stanzas) ? poem.stanzas.flat() : [];
    const text = lines.length ? lines.join('\n') : poem.text ?? poem.text_plain ?? '';
    this.#blockquote.textContent = text;
    this.#cite.innerHTML = `<span class="poet">${this.#escapeHtml(poem.poet_name ?? '')}</span>` +
      (poem.collection_title ? ` — <span>${this.#escapeHtml(poem.collection_title)}</span>` : '');
  }

  #escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
  }
}

if (!customElements.get('persian-quote')) {
  customElements.define('persian-quote', PersianQuote);
}

export { PersianQuote };
export default PersianQuote;
