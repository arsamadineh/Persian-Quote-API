import { describe, it, expect } from 'bun:test';
import { lightStem } from '../src';

describe('packages/persian: Stemmer Module', () => {
  it('strips verbal prefixes without over-stemming', () => {
    expect(lightStem('می‌رود')).toBe('رود');
    expect(lightStem('نمی‌خواهم')).toBe('خواهم');
    expect(lightStem('همی‌گفت')).toBe('گفت');
    expect(lightStem('بی‌دل')).toBe('دل');
  });

  it('strips nominal plural suffixes', () => {
    expect(lightStem('کتاب‌ها')).toBe('کتاب');
    expect(lightStem('کتابها')).toBe('کتاب');
    expect(lightStem('درختان')).toBe('درخت');
    expect(lightStem('کلمات')).toBe('کلم');
  });

  it('strips comparative and superlative suffixes', () => {
    expect(lightStem('بهتر')).toBe('به');
    expect(lightStem('زیباترین')).toBe('زیبا');
  });

  it('strips possessive clitics', () => {
    expect(lightStem('کتاب‌هایم')).toBe('کتاب');
    expect(lightStem('کتاب‌ام')).toBe('کتاب');
    expect(lightStem('دستشان')).toBe('دست');
    expect(lightStem('خانه‌مان')).toBe('خانه');
  });

  it('protects short words and stopwords from stripping', () => {
    expect(lightStem('می')).toBe('می');
    expect(lightStem('ما')).toBe('ما');
    expect(lightStem('دل')).toBe('دل');
    expect(lightStem('تن')).toBe('تن');
    expect(lightStem('دست')).toBe('دست');
  });

  it('handles empty string gracefully', () => {
    expect(lightStem('')).toBe('');
  });
});
