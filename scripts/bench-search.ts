// سنجش سادۀ سرعت مخزن داده و جستجو.
// اجرا: bun scripts/bench-search.ts
// این اسکریپت هیچ خروجی فایلی نمی‌سازد و فقط زمان‌بندی می‌کند.

import {
  searchQuotes,
  getShereno,
  getQuotesForPoet,
  getPoets,
  getStats,
  dataset,
  presentQuotes,
} from "../lib/data/store";
import { layoutPoem } from "../lib/data/poem-lines";

const QUERIES = [
  "حافظ شیراز",
  "سهراب سپهری قایق",
  "عشق و تنهایی",
  "مسافر",
  "شعر نو",
  "نیما یوشیج",
  "گیاهان عاشق نورند",
  "دلم گرفته",
];

function timeIt(label: string, iterations: number, fn: () => void): number {
  fn(); // گرم‌کردن
  const started = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - started;
  const perCall = elapsed / iterations;
  console.log(`${label.padEnd(34)} ${perCall.toFixed(3)} ms/op  (${iterations} اجرا)`);
  return perCall;
}

console.log("=== وضعیت مجموعه داده ===");
console.log(JSON.stringify(getStats()));
// زمان بارگذاری ماژول در این اسکریپت قابل اندازه‌گیری نیست چون پیش از اجرای بدنه
// انجام می‌شود. برای سنجش آن:
//   bun -e 'const t=performance.now(); await import("./lib/data/store"); console.log(performance.now()-t)'
const renderStarted = performance.now();
let warmSource = 0;
for (const quote of dataset.shereno.slice(0, 200)) warmSource += quote.text_persian.length;
console.log(`بارگذاری داده در حافظه: ${(performance.now() - renderStarted).toFixed(2)} ms (${warmSource} نویسه)`);

console.log("\n=== جستجو ===");
let total = 0;
for (const q of QUERIES) {
  total += timeIt(`searchQuotes("${q}")`, 20, () => {
    searchQuotes(new URLSearchParams({ q, limit: "10" }));
  });
}
console.log(`میانگین جستجو: ${(total / QUERIES.length).toFixed(3)} ms`);

console.log("\n=== اندپوینت‌ها ===");
timeIt('getShereno(poet=سهراب سپهری)', 200, () =>
  getShereno(new URLSearchParams({ poet: "سهراب سپهری", limit: "10" })),
);
timeIt("getQuotesForPoet(فروغ فرخزاد)", 200, () => getQuotesForPoet("فروغ فرخزاد"));
timeIt("getPoets()", 20, () => getPoets());

console.log("\n=== لایهٔ نمایش شعر نو (بازسازی سطر) ===");
const sample = dataset.shereno.slice(0, 120);
// تحلیل سرد: هر بار متن از نو نرمال و سطر‌بندی می‌شود
timeIt("تحلیل سرد ۱۲۰ شعر (layoutPoem)", 3, () => {
  for (const quote of sample) layoutPoem(quote.text_persian, "auto");
});
timeIt("presentQuotes ۱۲۰ شعر (از حافظه)", 200, () => {
  presentQuotes(sample, "auto");
});
timeIt("getShereno + present", 100, () => {
  const r = getShereno(new URLSearchParams({ poet: "سهراب سپهری", limit: "20" }));
  presentQuotes(r.data, "auto");
});
