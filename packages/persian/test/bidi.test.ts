import { describe, it, expect } from 'bun:test';
import { detectDirection, bidiIsolate, stripBidiControls } from '../src';

describe('packages/persian: BiDi Module', () => {
  it('detects text direction accurately', () => {
    expect(detectDirection('حافظ شیرازی')).toBe('rtl');
    expect(detectDirection('Hafez')).toBe('ltr');
    expect(detectDirection('12345')).toBe('neutral');
    expect(detectDirection('')).toBe('neutral');
  });

  it('isolates text with Unicode isolates', () => {
    const persian = 'حافظ';
    expect(bidiIsolate(persian)).toBe('\u2067حافظ\u2069'); // RLI
    expect(bidiIsolate(persian, { mode: 'fsi' })).toBe('\u2068حافظ\u2069'); // FSI
    expect(bidiIsolate('Hafez', { mode: 'lri' })).toBe('\u2066Hafez\u2069'); // LRI

    // Embed LTR mode
    const mixed = 'غزل شماره 42 در divan.json';
    const embedded = bidiIsolate(mixed, { mode: 'embed_ltr' });
    expect(embedded).toContain('\u206642\u2069');
    expect(embedded).toContain('\u2066divan.json\u2069');
  });

  it('strips bidi control marks', () => {
    const controlled = '\u2067حافظ\u2069 \u200eسعدی\u200f \u202bمولانا\u202c';
    expect(stripBidiControls(controlled)).toBe('حافظ سعدی مولانا');
    expect(stripBidiControls('')).toBe('');
  });
});
