import './dom-shim';
import { describe, test, expect } from 'bun:test';
import { PersianQuote } from '../src/index';

describe('packages/widget: <persian-quote> web component', () => {
  test('custom element class is exported', () => {
    expect(typeof PersianQuote).toBe('function');
  });

  test('component constructs with shadow DOM', () => {
    const el = new PersianQuote();
    expect(el.shadowRoot).toBeTruthy();
  });
});
