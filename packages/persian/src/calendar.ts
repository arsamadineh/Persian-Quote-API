export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface GregorianDate {
  year: number;
  month: number;
  day: number;
  iso: string;
}

function div(a: number, b: number): number {
  return ~~(a / b);
}

interface JalaliCalResult {
  leap: number;
  gy: number;
  march: number;
}

function jalaliCal(jy: number): JalaliCalResult {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
    2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0]!;
  let jm: number;
  let jump = 0;

  if (jy < jp || jy >= breaks[bl - 1]!) {
    throw new RangeError(`Invalid Jalali year: ${jy}`);
  }

  for (let i = 1; i < bl; i++) {
    jm = breaks[i]!;
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(jump % 33, 4);
    jp = jm;
  }
  let n = jy - jp;

  leapJ = leapJ + div(n, 33) * 8 + div((n % 33) + 3, 4);
  if ((jump % 33) === 4 && jump - n === 4) {
    leapJ += 1;
  }

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) {
    n = n - jump + div(jump + 4, 33) * 33;
  }
  let leap = (((n + 1) % 33) - 1) % 4;
  if (leap === -1) {
    leap = 4;
  }

  return { leap, gy, march };
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalaliCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function d2j(jdn: number): JalaliDate {
  const g = d2g(jdn);
  let jy = g.year - 621;
  const r = jalaliCal(jy);
  const jdn1f = g2d(g.year, 3, r.march);
  let k = jdn - jdn1f;
  let jm: number;
  let jd: number;

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = (k % 31) + 1;
      return { year: jy, month: jm, day: jd };
    } else {
      k -= 186;
    }
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + div(k, 30);
  jd = (k % 30) + 1;
  return { year: jy, month: jm, day: jd };
}

function g2d(gy: number, gm: number, gd: number): number {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
    + div(153 * ((gm + 9) % 12) + 2, 5)
    + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number): { year: number; month: number; day: number } {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(j % 1461, 4) * 5 + 308;
  const gd = div(i % 153, 5) + 1;
  const gm = (div(i, 153) % 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { year: gy, month: gm, day: gd };
}

export function isJalaliLeapYear(jy: number): boolean {
  return jalaliCal(jy).leap === 0;
}

export function isGregorianLeapYear(gy: number): boolean {
  return (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0;
}

export function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm < 1 || jm > 12) {
    throw new RangeError(`Invalid Jalali month: ${jm}`);
  }
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeapYear(jy) ? 30 : 29;
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
  if (jm < 1 || jm > 12 || jd < 1 || jd > daysInJalaliMonth(jy, jm)) {
    throw new RangeError(`Invalid Jalali date: ${jy}/${jm}/${jd}`);
  }
  const jdn = j2d(jy, jm, jd);
  const g = d2g(jdn);
  const iso = `${g.year.toString().padStart(4, '0')}-${g.month.toString().padStart(2, '0')}-${g.day.toString().padStart(2, '0')}`;
  return { year: g.year, month: g.month, day: g.day, iso };
}

export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  if (gm < 1 || gm > 12 || gd < 1 || gd > 31) {
    throw new RangeError(`Invalid Gregorian date: ${gy}/${gm}/${gd}`);
  }
  const jdn = g2d(gy, gm, gd);
  return d2j(jdn);
}

export function parseJalaliDate(s: string): JalaliDate | null {
  if (!s) return null;
  const m = s.match(/(?:^|\D)(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\D|$)/);
  if (!m || !m[1] || !m[2] || !m[3]) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}
