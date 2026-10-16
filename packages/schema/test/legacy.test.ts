import { describe, it, expect } from 'bun:test';
import * as path from 'path';
import * as fs from 'fs';
import {
  LegacyListResponseSchema,
  LegacyPoetsResponseSchema,
  LegacyCategoriesResponseSchema,
  LegacyStatsResponseSchema,
  LegacyHealthResponseSchema,
} from '../src';

describe('packages/schema: Legacy Golden Contracts Validation (30/30)', () => {
  const contractsDir = path.resolve(__dirname, '../../../data/golden/contracts');
  const indexFile = path.join(contractsDir, 'index.json');
  const indexData = JSON.parse(fs.readFileSync(indexFile, 'utf8')) as Array<{
    slug: string;
    path: string;
    status: number;
    file: string;
  }>;

  it('contains exactly 30 golden contracts in the index', () => {
    expect(indexData.length).toBe(30);
  });

  for (const item of indexData) {
    it(`validates golden contract: ${item.slug} (${item.file})`, () => {
      const filePath = path.join(contractsDir, item.file);
      expect(fs.existsSync(filePath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      expect(content.statusCode).toBe(item.status);

      if (item.slug.startsWith('embed_')) {
        // Embed endpoints return HTML
        expect(typeof content.body).toBe('string');
        expect(content.headers.contentType).toContain('text/html');
        expect(content.body).toContain('persian-quote-widget');
      } else if (item.slug === 'poets_catalog') {
        const res = LegacyPoetsResponseSchema.safeParse(content.body);
        if (!res.success) {
          console.error(`Validation error in ${item.file}:`, res.error.format());
        }
        expect(res.success).toBe(true);
        expect(content.body.data.length).toBeGreaterThan(0);
      } else if (item.slug === 'categories_catalog') {
        const res = LegacyCategoriesResponseSchema.safeParse(content.body);
        if (!res.success) {
          console.error(`Validation error in ${item.file}:`, res.error.format());
        }
        expect(res.success).toBe(true);
        expect(content.body.data.length).toBeGreaterThan(0);
      } else if (item.slug === 'stats') {
        const res = LegacyStatsResponseSchema.safeParse(content.body);
        if (!res.success) {
          console.error(`Validation error in ${item.file}:`, res.error.format());
        }
        expect(res.success).toBe(true);
      } else if (item.slug === 'health') {
        const res = LegacyHealthResponseSchema.safeParse(content.body);
        if (!res.success) {
          console.error(`Validation error in ${item.file}:`, res.error.format());
        }
        expect(res.success).toBe(true);
      } else {
        // All quote listing, search, poet, and category routes return LegacyListResponse
        const res = LegacyListResponseSchema.safeParse(content.body);
        if (!res.success) {
          console.error(`Validation error in ${item.file}:`, res.error.format());
        }
        expect(res.success).toBe(true);
        expect(content.body.success).toBe(true);
      }
    });
  }
});
