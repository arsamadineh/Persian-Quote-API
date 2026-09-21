import { describe, test, expect } from "bun:test";
import {
  analyzePoem,
  layoutPoem,
  normalizePoemTypography,
  reconstructLines,
} from "../lib/data/poem-lines";
import { dataset, presentQuote, presentQuotes } from "../lib/data/store";
import { createNextHandler, engine } from "../lib/engine/instance";

const SHERENO = dataset.shereno;
const findPoem = (poet: string, title: string) =>
  SHERENO.find((q) => q.poet === poet && q.title === title)!;

describe("نرمال‌سازی نوشتاری شعر", () => {
  test("ویرگول نادرست و املای عربی را یکسان می‌کند", () => {
    expect(normalizePoemTypography("سلام ‚ دنياي كوچك")).toBe("سلام، دنیای کوچک");
  });

  test("فاصله پیش از نشانه‌گذاری را حذف و فاصله پس از آن را تضمین می‌کند", () => {
    expect(normalizePoemTypography("قشنگ یعنی چه ؟")).toBe("قشنگ یعنی چه؟");
    expect(normalizePoemTypography("گفتم:سلام")).toBe("گفتم: سلام");
  });
});

describe("تفکیک شکست خط‌های واقعی منبع", () => {
  test("ستاره جداکنندهٔ بند است و سطر خالی می‌سازد", () => {
    const source = analyzePoem("سطر یک * سطر دو * سطر سه");
    expect(source.hasBreaks).toBe(true);
    expect(source.lines).toEqual(["سطر یک", "", "سطر دو", "", "سطر سه"]);
  });

  test("فاصلهٔ دوگانه شکست خط است اما فاصلهٔ انتهایی شعر نه", () => {
    const source = analyzePoem("بر سر قایقش اندیشه کنان  قایق بان   ");
    expect(source.lines).toEqual(["بر سر قایقش اندیشه کنان", "قایق بان"]);
  });

  test("شعر بدون نشانه در حالت separators یک سطر می‌ماند", () => {
    const layout = layoutPoem("یک دو سه چهار", "separators");
    expect(layout.origin).toBe("flat");
    expect(layout.lines).toEqual(["یک دو سه چهار"]);
  });
});

describe("بازسازی تقریبی سطرها", () => {
  const words = (value: string) => value.split(/\s+/).filter(Boolean);

  test("هیچ واژه‌ای حذف، افزوده یا جابه‌جا نمی‌شود", () => {
    let missing = 0;
    for (const quote of SHERENO.slice(0, 250)) {
      const source = analyzePoem(quote.text_persian);
      const rebuilt = reconstructLines(source.flat);
      if (rebuilt.join(" ") !== source.flat) missing++;
    }
    expect(missing).toBe(0);
  });

  test("پیوند «می» و «را» نمی‌شکند", () => {
    const violations: string[] = [];
    for (const quote of SHERENO.slice(0, 250)) {
      const source = analyzePoem(quote.text_persian);
      const lines = reconstructLines(source.flat);
      for (let i = 0; i < lines.length - 1; i++) {
        const tail = words(lines[i]).pop();
        const head = words(lines[i + 1])[0];
        if (!tail || !head) continue;
        if (["می", "نمی", "بی"].includes(tail)) violations.push(`${quote.id} «${tail}» پایان سطر`);
        if (["را", "است", "بود", "شد"].includes(head.replace(/[،؛؟!:»]+$/, "")))
          violations.push(`${quote.id} «${head}» آغاز سطر`);
      }
    }
    expect(violations.slice(0, 5)).toEqual([]);
  });

  test("سطرها از سقف طول تعیین‌شده بیرون نمی‌زنند", () => {
    const longest = reconstructLines(analyzePoem(findPoem("سهراب سپهری", "مسافر").text_persian).flat)
      .reduce((max, line) => Math.max(max, line.length), 0);
    expect(longest).toBeLessThanOrEqual(64);
  });
});

describe("لایهٔ نمایش برای اندپوینت‌ها", () => {
  test("مسافر شکست خط می‌گیرد و منبع آن اعلام می‌شود", () => {
    const quote = findPoem("سهراب سپهری", "مسافر");
    const presented = presentQuote(quote, "auto");
    const text = String(presented.text_persian);
    expect(text.includes("\n")).toBe(true);
    expect(text.split("\n").length).toBeGreaterThan(100);
    expect(presented.line_origin).toBe("reconstructed");
    expect(presented.line_count).toBe(text.split("\n").length);
  });

  test("حالت raw متن دست‌نخوردهٔ منبع را برمی‌گرداند", () => {
    const quote = findPoem("سهراب سپهری", "مسافر");
    const raw = presentQuote(quote, "raw");
    expect(raw.line_origin).toBe("raw");
    expect(String(raw.text_persian).includes("\n")).toBe(false);
    expect(String(raw.text_persian)).toBe(quote.text_persian);
  });

  test("حالت separators در نبود نشانه، سطر نمی‌سازد", () => {
    const quote = findPoem("سهراب سپهری", "مسافر");
    const separated = presentQuote(quote, "separators");
    expect(separated.line_origin).toBe("flat");
    expect(String(separated.text_persian).includes("\n")).toBe(false);
  });

  test("شعر نیما با نشانه‌های واقعی جدا می‌شود", () => {
    const quote = findPoem("نیما یوشیج", "بر سر قایقش");
    const presented = presentQuote(quote, "auto");
    expect(presented.line_origin).toBe("separators");
    expect(String(presented.text_persian).startsWith("بر سر قایقش اندیشه کنان\n")).toBe(true);
    expect(String(presented.text_persian).includes("\n\n")).toBe(true);
  });

  test("فیلد داخلی جستجو در پاسخ API لو نمی‌رود", () => {
    const [first] = presentQuotes(SHERENO.slice(0, 3), "auto");
    expect(Object.keys(first)).not.toContain("search");
    expect(Object.keys(first)).toContain("line_origin");
  });
});

describe("پاسخ اندپوینت شعر نو", () => {
  const handler = createNextHandler(engine);
  const call = async (query: string) => {
    const response = await handler(
      new Request(`http://localhost/api/quotes/shereno?${query}`),
      { params: Promise.resolve({}) },
    );
    return response.json() as Promise<any>;
  };

  test("مسافر با شکست خط و اعلام منبع برمی‌گردد", async () => {
    const body = await call("poet=%D8%B3%D9%87%D8%B1%D8%A7%D8%A8%20%D8%B3%D9%BE%D9%87%D8%B1%DB%8C&title=%D9%85%D8%B3%D8%A7%D9%81%D8%B1");
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
    expect(body.line_mode).toBe("auto");
    expect(body.data[0].line_origin).toBe("reconstructed");
    expect(body.data[0].text_persian).toContain("\n");
    expect(body.data[0].search).toBeUndefined();
  });

  test("پارامتر lines=raw متن تک‌سطری منبع را می‌دهد", async () => {
    const body = await call(
      "poet=%D8%B3%D9%87%D8%B1%D8%A7%D8%A8%20%D8%B3%D9%BE%D9%87%D8%B1%DB%8C&title=%D9%85%D8%B3%D8%A7%D9%81%D8%B1&lines=raw",
    );
    expect(body.line_mode).toBe("raw");
    expect(body.data[0].line_origin).toBe("raw");
    expect(body.data[0].text_persian).not.toContain("\n");
  });
});
