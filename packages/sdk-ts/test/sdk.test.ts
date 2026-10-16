import { describe, test, expect } from 'bun:test';
import { PersianQuoteSDK } from '../src/index';

const poemShape = {
  id: 'w1',
  title: 'عشق',
  poet_name: 'حافظ',
  poet_id: 'hafez',
  collection_id: 'ghazaliat',
  collection_title: 'دیوان حافظ',
  form: 'ghazal',
  text_plain: 'عشق است',
  stanzas: [['عشق است']],
};

describe('packages/sdk-ts: TypeScript SDK', () => {
  test('offline mode: getPoem, randomPoem, listPoets', async () => {
    const works = [
      { ...poemShape, id: 'hafez.ghazaliat.1', title: 'غزل ۱' },
      { ...poemShape, id: 'saadi.bustan.1', title: 'بوستان', poet_name: 'سعدی', poet_id: 'saadi' },
    ];
    const poets = [{ slug: 'hafez', name_persian: 'حافظ', name_english: 'Hafez', era: 'timurid' }];
    const sdk = new PersianQuoteSDK({ origins: ['http://example.com'], offlineData: { works, poets } });

    const poem = await sdk.getPoem('hafez.ghazaliat.1');
    expect(poem.id).toBe('hafez.ghazaliat.1');
    expect(poem.poet_name).toBe('حافظ');

    const list = await sdk.listPoets();
    expect(list.length).toBe(1);
    expect(list[0].slug).toBe('hafez');

    const rnd = await sdk.randomPoem();
    expect(['hafez.ghazaliat.1', 'saadi.bustan.1']).toContain(rnd.id);
  });

  test('offline search filters by query and poet', async () => {
    const works = [
      { ...poemShape, id: 'w1', title: 'عشق', poet_name: 'حافظ', poet_id: 'hafez', text_plain: 'عشق است' },
      { ...poemShape, id: 'w2', title: 'حکمت', poet_name: 'سعدی', poet_id: 'saadi', text_plain: 'حکمت است' },
    ];
    const sdk = new PersianQuoteSDK({ origins: ['http://example.com'], offlineData: { works, poets: [] } });

    const all = await sdk.search({ q: '' });
    expect(all.total).toBe(2);

    const byQuery = await sdk.search({ q: 'عشق' });
    expect(byQuery.total).toBe(1);
    expect(byQuery.items[0].id).toBe('w1');

    const byPoet = await sdk.search({ q: '', poet: 'saadi' });
    expect(byPoet.total).toBe(1);
    expect(byPoet.items[0].poet_id).toBe('saadi');
  });

  test('daily and fal return poems', async () => {
    const works = [{ ...poemShape, id: 'w1', title: 'عشق', poet_name: 'حافظ', poet_id: 'hafez', text_plain: 'عشق' }];
    const sdk = new PersianQuoteSDK({ origins: ['http://example.com'], offlineData: { works, poets: [] } });

    const daily = await sdk.dailyPoem();
    expect(daily.poem.id).toBeDefined();

    const fal = await sdk.falHafez();
    expect(fal.poem.id).toBeDefined();
  });
});
