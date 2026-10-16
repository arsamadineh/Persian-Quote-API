import { describe, test, expect } from 'bun:test';
import { InvertedIndex } from '../src/index/inverted-index';
import { SearchEngine } from '../src/search/search-engine';
import { transliterateFinglish } from '../src/transliteration/finglish';
import { RhymeFinder, extractQafiyeh } from '../src/rhyme/rhyme';

const works = [
  {
    id: 'hafez.ghazaliat.1',
    title: 'غزل اول',
    text_plain: 'صلاح کار کجا و من خراب کجا ببین تفاوت ره کز کجاست تا به کجا',
    poet_name: 'حافظ شیرازی',
    poet_id: 'hafez',
    collection_id: 'ghazaliat',
    collection_title: 'دیوان حافظ',
    form: 'ghazal',
    tags: ['عشق', 'عرفان'],
  },
  {
    id: 'saadi.bustan.1',
    title: 'بوستان 종',
    text_plain: 'بهار آمد و بر لب جوی آب نشست و چنین گفت با آفتاب',
    poet_name: 'سعدی شیرازی',
    poet_id: 'saadi',
    collection_id: 'bustan',
    collection_title: 'بوستان',
    form: 'masnavi',
    tags: ['طبیعت', 'حکمت'],
  },
  {
    id: 'rumi.masnavi.1',
    title: 'مثنوی',
    text_plain: 'بشنو این نی',
    poet_name: 'مولانا رومی',
    poet_id: 'rumi',
    collection_id: 'masnavi',
    collection_title: 'مثنوی معنوی',
    form: 'masnavi',
    tags: ['عرفان'],
  },
];

describe('packages/search: InvertedIndex', () => {
  test('builds and searches BM25F', () => {
    const index = new InvertedIndex(
      ['text', 'title', 'poet', 'tags'],
      { text: 1.0, title: 3.0, poet: 4.0, tags: 2.0 }
    );
    for (const w of works) {
      index.add(w.id, {
        text: w.text_plain,
        title: w.title,
        poet: w.poet_name,
        tags: w.tags.join(' '),
      }, {});
    }
    index.build();
    const results = index.searchTerm('کجا');
    expect(results.size).toBeGreaterThan(0);
    const top = [...results.entries()].sort((a, b) => b[1].score - a[1].score)[0];
    expect(top[0]).toBe('hafez.ghazaliat.1');
  });

  test('searchTerm returns empty for unknown term', () => {
    const index = new InvertedIndex(['text'], { text: 1.0 });
    index.add('d1', { text: 'abc def' }, {});
    index.build();
    expect(index.searchTerm('xyz').size).toBe(0);
  });
});

describe('packages/search: SearchEngine', () => {
  const engine = SearchEngine.fromWorks(works);

  test('finds poem by title term', () => {
    const res = engine.search('غزل');
    expect(res.total).toBeGreaterThan(0);
    expect(res.items[0].id).toBe('hafez.ghazaliat.1');
  });

  test('filters by poet', () => {
    const res = engine.search('بشنو', { poet: 'rumi' });
    expect(res.items.every((i) => (i.doc as any).poet_id === 'rumi')).toBe(true);
  });

  test('filters by tag', () => {
    const res = engine.search('عشق', { tag: 'عشق' });
    expect(res.total).toBeGreaterThan(0);
    expect(res.items[0].id).toBe('hafez.ghazaliat.1');
  });

  test('returns empty for no match', () => {
    const res = engine.search('nonexistenttermxyz');
    expect(res.total).toBe(0);
    expect(res.items.length).toBe(0);
  });

  test('pagination works', () => {
    const res = engine.search('', { limit: 1 });
    expect(res.count).toBeLessThanOrEqual(1);
    expect(res.limit).toBe(1);
  });
});

describe('packages/search: Finglish', () => {
  test('transliterates eshgh to عشق', () => {
    expect(transliterateFinglish('eshgh')).toBe('عشق');
  });

  test('returns input for non-finglish', () => {
    expect(transliterateFinglish('عشق')).toBe('عشق');
  });
});

describe('packages/search: Rhyme', () => {
  const finder = new RhymeFinder(
    ['کجا', 'ره', '델'],
    [
      { poemId: 'p1', poet: 'حافظ', line: 'صلاح کار کجا و من خراب کجا' },
      { poemId: 'p2', poet: 'سعدی', line: 'بین تفاوت ره کز کجاست' },
    ]
  );

  test('finds rhyming words and verses', () => {
    const res = finder.find('کجا');
    expect(res.qafiyeh).toBeDefined();
    expect(res.verses.length).toBeGreaterThan(0);
  });

  test('extractQafiyeh returns key', () => {
    expect(extractQafiyeh('کجا')).toBeDefined();
  });
});
