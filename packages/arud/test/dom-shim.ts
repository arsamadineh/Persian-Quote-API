const mockEl: any = {
  appendChild: () => mockEl,
  removeChild: () => {},
  querySelector: () => mockEl,
  addEventListener: () => {},
  setAttribute: () => {},
  getAttribute: () => null,
  textContent: '',
  innerHTML: '',
  className: '',
  style: {},
  rows: 0,
  value: '',
  placeholder: '',
  dir: '',
  parentNode: null,
};
const doc: any = {
  createElement: () => ({ ...mockEl, style: {}, appendChild: () => mockEl, querySelector: () => mockEl, addEventListener: () => {} }),
  createElementNS: () => mockEl,
};
globalThis.document = doc as any;
globalThis.window = { print: () => {} } as any;
globalThis.HTMLElement = class { style = {}; appendChild = () => {}; } as any;
