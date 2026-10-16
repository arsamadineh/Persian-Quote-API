// DOM shim so packages/widget/src/index.ts (which uses document at module load)
// can be imported under bun test (no browser DOM).
const mockEl = {
  appendChild: () => mockEl,
  querySelector: () => mockEl,
  addEventListener: () => {},
  setAttribute: () => {},
  getAttribute: () => null,
  textContent: '',
  innerHTML: '',
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  style: {},
  click: () => {},
};
const shadowRoot = {
  appendChild: () => mockEl,
  querySelector: () => mockEl,
  addEventListener: () => {},
};
const templateContent = { cloneNode: () => ({ appendChild: () => {} }) };
const host = {
  shadowRoot,
  attachShadow: () => shadowRoot,
  setAttribute: () => {},
  getAttribute: () => null,
  addEventListener: () => {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  style: {},
};
globalThis.document = {
  createElement: (tag: string) => (tag === 'template' ? { content: templateContent } : host),
  createElementNS: () => host,
  body: { appendChild: () => {}, removeChild: () => {} },
  documentElement: host,
  head: host,
} as any;
globalThis.customElements = { get: () => undefined, define: () => {} } as any;
globalThis.HTMLElement = class {
  shadowRoot: any;
  constructor() { this.shadowRoot = shadowRoot; }
  attachShadow() { return shadowRoot; }
  addEventListener() {}
  setAttribute() {}
  getAttribute() { return null; }
} as any;
globalThis.fetch = (async () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })) as any;
