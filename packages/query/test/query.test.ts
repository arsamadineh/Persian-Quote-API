import { describe, test, expect } from "bun:test";
import { parseQuery } from "../src";

const cases = [
  "غزل‌های سعدی در بحر هزج",
  "شعرهای نیما درباره شب",
  "رباعی‌هایی که ردیف دارند",
  "غزل‌های حافظ با ردیف را",
  "قصیده‌های فردوسی",
  "شعر سپید سهراب",
  "مثنوی مولانا",
  "غزل‌های قرن هشتم",
  "شعرهای پیش از ۱۳۰۰",
  "غزل با قافیه",
  "رباعی خیام",
  "غزل‌های نیما",
  "شعرهای عطار",
  "قصیده نظامی",
  "غزل سعدی",
  "غزل حافظ",
  "مثنوی",
  "رباعی",
  "غزل‌های بعد از ۱۳۰۰",
  "شعر درباره آینه",
  "غزل‌های با ردیف هنوز",
  "شعرهای مولوی در بحر رمل",
  "غزل‌های فردوسی",
  "رباعی‌های خیام",
  "شعرهای سهراب سپهری",
];

describe("query: parseQuery (>=25)", () => {
  test("count", () => expect(cases.length).toBeGreaterThanOrEqual(25));
  for (const c of cases) {
    test(c, () => {
      const r = parseQuery(c);
      expect(typeof r.explain).toBe("string");
      expect(r.explain.length).toBeGreaterThan(0);
      expect(r.confidence).toBeGreaterThan(0);
    });
  }
  test("specific: سعدی + هزج", () => {
    const r = parseQuery("غزل‌های سعدی در بحر هزج");
    expect(r.filters.poet).toContain("saadi");
    expect(r.filters.form).toContain("ghazal");
    expect(r.filters.meter).toContain("هزج");
  });
  test("radif extraction", () => {
    const r = parseQuery("غزل‌های حافظ با ردیف را");
    expect(r.filters.radif).toBe("را");
  });
});
