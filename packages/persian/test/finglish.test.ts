import { describe, it, expect } from 'bun:test';
import { finglishQuery, transliterateFinglish } from '../src';

describe('packages/persian: Finglish Module', () => {
  it('resolves famous poet dictionary names directly', () => {
    expect(finglishQuery('hafez')).toContain('حافظ');
    expect(finglishQuery('saadi')).toContain('سعدی');
    expect(finglishQuery('molana')).toContain('مولانا');
    expect(finglishQuery('rumi')).toContain('مولانا');
    expect(finglishQuery('ferdowsi')).toContain('فردوسی');
    expect(finglishQuery('khayyam')).toContain('خیام');
    expect(finglishQuery('sohrab')).toContain('سهراب');
    expect(finglishQuery('forough')).toContain('فروغ');
    expect(finglishQuery('shamloo')).toContain('شاملو');
  });

  it('transliterates general Finglish phrases using phoneme and digraph rules', () => {
    const q1 = finglishQuery('khanoom');
    expect(q1[0]).toContain('خان');

    const q2 = finglishQuery('shab');
    expect(q2[0]).toBe('شب');

    const full = transliterateFinglish('eshgh va baran');
    expect(full).toBe('عشق و باران');
  });

  it('passes through Persian or mixed non-Latin text untouched', () => {
    expect(finglishQuery('حافظ')).toEqual(['حافظ']);
    expect(finglishQuery('شعر hafez')).toEqual(['شعر hafez']);
    expect(finglishQuery('')).toEqual([]);
  });

  it('handles Object.prototype property names safely without throwing or returning undefined', () => {
    const prototypeKeys = [
      '__proto__',
      'constructor',
      'toString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
    ];

    for (const key of prototypeKeys) {
      expect(() => finglishQuery(key)).not.toThrow();
      const q = finglishQuery(key);
      expect(Array.isArray(q)).toBe(true);
      expect(q.length).toBeGreaterThan(0);
      expect(typeof q[0]).toBe('string');
      expect(q[0]).not.toBe('[object Object]');
      expect(q[0]).not.toBe('undefined');

      expect(() => transliterateFinglish(key)).not.toThrow();
      const t = transliterateFinglish(key);
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it('correctly transliterates prototype property names phonetically', () => {
    expect(finglishQuery('__proto__')).toEqual(['__پروتو__']);
    expect(finglishQuery('constructor')[0]).toContain('ک');
  });
});

