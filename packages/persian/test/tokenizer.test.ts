import { describe, it, expect } from 'bun:test';
import { tokenize } from '../src';

describe('packages/persian: Tokenizer Module', () => {
  it('tokenizes Persian words respecting internal ZWNJ', () => {
    const text = 'حافظ شیرازی می‌گوید خانه‌ها زیباست.';
    const tokens = tokenize(text);
    expect(tokens).toEqual(['حافظ', 'شیرازی', 'می‌گوید', 'خانه‌ها', 'زیباست']);
  });

  it('tokenizes Persian text with punctuation tokens when includePunctuation is true', () => {
    const text = 'سلام، دوست من!';
    const tokens = tokenize(text, { includePunctuation: true });
    expect(tokens).toEqual(['سلام', '،', 'دوست', 'من', '!']);
  });

  it('filters out edge ZWNJs from tokens', () => {
    const text = '\u200cکتاب\u200c \u200cدفتر\u200c';
    const tokens = tokenize(text);
    expect(tokens).toEqual(['کتاب', 'دفتر']);
  });

  it('handles empty string and whitespace-only strings gracefully', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   \t  \n  ')).toEqual([]);
  });

  it('tokenizes mixed numbers and Latin words', () => {
    const text = 'غزل شماره 42 از Hafez';
    const tokens = tokenize(text);
    expect(tokens).toEqual(['غزل', 'شماره', '42', 'از', 'Hafez']);
  });
});
