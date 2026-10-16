import { toAsciiDigits, jalaliToGregorian, daysInJalaliMonth } from "@persian-quote/persian";
import type { Colophon } from "@persian-quote/schema";

export interface ExtractedColophon extends Colophon {
  date: string;
}

export interface ColophonExtractionResult {
  body: string;
  colophon?: ExtractedColophon;
}

const PERSIAN_MONTHS: Record<string, number> = {
  فروردین: 1,
  اردیبهشت: 2,
  خرداد: 3,
  تیر: 4,
  مرداد: 5,
  شهریور: 6,
  مهر: 7,
  آبان: 8,
  آذر: 9,
  دی: 10,
  بهمن: 11,
  اسفند: 12,
};

const SEASONS: Record<string, number> = {
  بهار: 1,
  تابستان: 4,
  پاییز: 7,
  زمستان: 10,
};

export function extractColophon(raw: string): ColophonExtractionResult {
  if (!raw || typeof raw !== "string") {
    return { body: raw || "" };
  }

  const ascii = toAsciiDigits(raw);

  // Restricted prefix: only Jalali month or season names (avoids consuming last poem word).
  const monthSeasonAlt = Object.keys(PERSIAN_MONTHS).concat(Object.keys(SEASONS)).join("|");
  // Pattern for date at the end of the text:
  // e.g. "12/2/1364", "1364/2/12", "زمستان 1331", "1331", "12-2-1364", "27/2/88" (2-digit year -> 13yy)
  const dateMatch = ascii.match(
    new RegExp(
      `(?:(?<=\\s|^)(${monthSeasonAlt})\\s+)?(?<!\\d)(?:(\\d{1,2})\\s*[\\/\\-.\\s]\\s*)?(?:(\\d{1,2})\\s*[\\/\\-.\\s]\\s*)?(\\d{4})\\s*$`,
      "u"
    )
  );
  let useTwoDigitFallback = false;
  let fallbackMatch: RegExpMatchArray | null = null;
  if (!dateMatch || dateMatch.index === undefined) {
    // Fallback: d/m/yy with 2-digit year (e.g. 27/2/88 -> 1388, 14/2/65 -> 1365).
    fallbackMatch = ascii.match(/(?<!\d)(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2})\s*$/u);
    if (!fallbackMatch || fallbackMatch.index === undefined) {
      return { body: raw };
    }
    useTwoDigitFallback = true;
  }

  const prefixWord = useTwoDigitFallback ? undefined : dateMatch?.[1];
  const part1 = useTwoDigitFallback ? fallbackMatch?.[1] : dateMatch?.[2];
  const part2 = useTwoDigitFallback ? fallbackMatch?.[2] : dateMatch?.[3];
  let yearStr = useTwoDigitFallback ? fallbackMatch?.[3] : dateMatch?.[4];
  if (!yearStr) {
    return { body: raw };
  }
  // Map 2-digit Jalali year to 13yy (e.g. 88 -> 1388, 65 -> 1365).
  let year: number;
  if (useTwoDigitFallback) {
    const yy = Number(yearStr);
    year = 1300 + yy;
    yearStr = String(year);
  } else {
    year = Number(yearStr);
  }

  const plausibleJalali = year >= 1250 && year <= 1450;
  const plausibleGregorian = year >= 1850 && year <= 2100;
  if (!plausibleJalali && !plausibleGregorian) {
    return { body: raw };
  }

  const activeMatch = useTwoDigitFallback ? fallbackMatch : dateMatch;
  if (!activeMatch || activeMatch.index === undefined) return { body: raw };
  const matchedDateRaw = activeMatch[0].trim();
  let head = raw.slice(0, activeMatch.index).replace(/[\s\/\-–—]+$/, "");

  // Try to find place preceding the date
  // e.g., "تنکابن، " or chunks separated by double spaces / newlines / asterisks
  const chunks = head.split(/\s{2,}|\n|\*/);
  const lastChunk = chunks[chunks.length - 1] ?? "";
  let place: string | undefined;

  // Check if last chunk is a place with comma: "تنکابن،"
  const strictMatch = lastChunk.match(/^\s*([\p{L}\u200c]+(?: [\p{L}\u200c]+){0,2})\s*[،,]\s*$/u);
  if (strictMatch && strictMatch[1]) {
    place = strictMatch[1].trim();
    head = head.slice(0, head.length - lastChunk.length).replace(/[\s\/\-–—]+$/, "");
  } else {
    const looseMatch = head.match(/(?<=\s)([\p{L}\u200c]+)\s*[،,]\s*$/u);
    if (looseMatch && looseMatch[1] && looseMatch.index !== undefined) {
      place = looseMatch[1].trim();
      head = head.slice(0, looseMatch.index).replace(/[\s\/\-–—]+$/, "");
    }
  }

  const setApart =
    /(?:\s{2,}|\n|\*)$/.test(raw.slice(0, activeMatch.index)) || /[/\-.]/.test(matchedDateRaw);
  if (!place && !setApart) {
    return { body: raw };
  }

  // Parse structured Jalali / Gregorian dates
  // For 2-digit fallback, reconstruct canonical date as d/m/yyyy.
  const cleanDateStr = useTwoDigitFallback
    ? `${part1}/${part2}/${year}`
    : matchedDateRaw.replace(/^[\p{L}\u200c]+\s+/u, "").replace(/\s*[/\-. \s]\s*/g, "/");
  const dateParts = cleanDateStr.split("/").filter(Boolean);

  let date_jalali: { y: number; m?: number; d?: number } | undefined;
  let date_gregorian: string | undefined;

  if (plausibleJalali) {
    let y = year;
    let m: number | undefined;
    let d: number | undefined;

    if (dateParts.length === 3) {
      // Could be d/m/y (e.g. 12/2/1364) or y/m/d (e.g. 1364/2/12)
      const p0 = Number(dateParts[0]);
      const p1 = Number(dateParts[1]);
      const p2 = Number(dateParts[2]);

      if (p2 === year) {
        // d/m/y
        d = p0;
        m = p1;
      } else if (p0 === year) {
        // y/m/d
        m = p1;
        d = p2;
      }
    } else if (dateParts.length === 2) {
      // m/y or y/m
      const p0 = Number(dateParts[0]);
      const p1 = Number(dateParts[1]);
      if (p1 === year) {
        m = p0;
      } else if (p0 === year) {
        m = p1;
      }
    } else {
      if (prefixWord && PERSIAN_MONTHS[prefixWord]) {
        m = PERSIAN_MONTHS[prefixWord];
      } else if (prefixWord && SEASONS[prefixWord]) {
        m = SEASONS[prefixWord];
      } else {
        // Check if text had month or season name before the year
        for (const [monthName, monthNum] of Object.entries(PERSIAN_MONTHS)) {
          if (matchedDateRaw.includes(monthName)) {
            m = monthNum;
            break;
          }
        }
        if (!m) {
          for (const [seasonName, seasonNum] of Object.entries(SEASONS)) {
            if (matchedDateRaw.includes(seasonName)) {
              m = seasonNum;
              break;
            }
          }
        }
      }
    }

    // Validate month and day
    if (m !== undefined && (m < 1 || m > 12)) m = undefined;
    if (d !== undefined && m !== undefined) {
      try {
        const maxDays = daysInJalaliMonth(y, m);
        if (d < 1 || d > maxDays) d = undefined;
      } catch {
        d = undefined;
      }
    }

    date_jalali = { y, ...(m !== undefined ? { m } : {}), ...(d !== undefined ? { d } : {}) };

    // Convert to Gregorian
    try {
      if (m !== undefined && d !== undefined) {
        const g = jalaliToGregorian(y, m, d);
        date_gregorian = g.iso;
      } else if (m !== undefined) {
        const g = jalaliToGregorian(y, m, 1);
        date_gregorian = `${g.year.toString().padStart(4, "0")}-${g.month.toString().padStart(2, "0")}`;
      } else {
        const g = jalaliToGregorian(y, 1, 1);
        date_gregorian = g.year.toString();
      }
    } catch {
      date_gregorian = (y + 621).toString();
    }
  } else if (plausibleGregorian) {
    date_gregorian = matchedDateRaw;
  }

  const colophon: ExtractedColophon = {
    ...(place ? { place } : {}),
    date: cleanDateStr || matchedDateRaw,
    date_raw: cleanDateStr || matchedDateRaw,
    ...(date_jalali ? { date_jalali } : {}),
    ...(date_gregorian ? { date_gregorian } : {}),
  };

  return {
    body: head.trim(),
    colophon,
  };
}
