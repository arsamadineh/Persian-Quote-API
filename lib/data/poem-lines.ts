// ============================================================================
// بازسازی ساختار سطری شعر نو
//
// مسئله: منبع داده (public/shereno.csv) هر شعر را در یک رشتهٔ تک‌سطری نگه می‌دارد؛
// شکست خط‌های اصلی هنگام استخراج به فاصله تبدیل شده‌اند. تنها بازماندهٔ ساختار،
// ستاره‌های جداکنندهٔ بند و فاصله‌های دوگانه است.
//
// این ماژول سه لایه را از هم جدا می‌کند:
//   ۱. raw          : متن دست‌نخوردهٔ منبع (فقط نرمال‌سازی یونیکد).
//   ۲. separators   : متن با شکست خط‌هایی که واقعاً در منبع نشانه دارند.
//   ۳. reconstructed: سطرهایی که با توزیع متوازن طول بازسازی شده‌اند.
//
// لایهٔ سوم قطعی و تقریبی است و ادعای مطابقت با سطرهای اصلی شاعر را ندارد؛
// فقط متن توده‌ای را خوانا می‌کند. خروجی همیشه منبع خود را در `origin` اعلام می‌کند.
// ============================================================================

export type LineOrigin = "raw" | "flat" | "separators" | "reconstructed"

export type LineMode = "auto" | "separators" | "raw"

export interface PoemLayout {
  /** متن نهایی، سطرها با \n از هم جدا شده‌اند. */
  text: string
  /** همان سطرها به‌صورت آرایه؛ بند خالی با رشتهٔ تهی نمایش داده می‌شود. */
  lines: string[]
  /** منبع شکست خط‌ها. */
  origin: LineOrigin
  /** تعداد سطرهای غیرتهی. */
  lineCount: number
}

/** نتیجهٔ یک‌بار تحلیل متن خام؛ برای هر شعر یک بار ساخته می‌شود. */
export interface PoemSource {
  /** متن خام دست‌نخورده. */
  raw: string
  /** سطرهایی که منبع با ستاره یا فاصلهٔ دوگانه جدا کرده است. */
  lines: string[]
  /** آیا منبع هیچ نشانهٔ شکست خطی داشت؟ */
  hasBreaks: boolean
  /** متن نرمال‌شدهٔ یک‌خطی. */
  flat: string
}

// نشانه‌های موقت برای جداکننده‌های واقعی. این نویسه‌ها در متن شعر فارسی رخ نمی‌دهند.
const STANZA_MARK = "\u0001"
const LINE_MARK = "\u0002"
const MARK_RUN = /[\u0001\u0002]+/g
const MARK_SCAN = /[\u0001\u0002]+/g

const STANZA_RUN = /\s*\*+\s*/g
const WIDE_SPACE_RUN = /[ \t\u00a0]{2,}/g
const SPECIAL_MARKS = /[\u200b\u200e\u200f\ufeff\u202a-\u202e]/g
const JUNK_GLYPHS = /[\u25a1\uf071]/g
const SPACE_BEFORE_PUNCT = /\s+([،؛؟!:])/g
const SPACE_AFTER_PUNCT = /([،؛؟!:])(?=[\p{L}\p{M}«"(])/gu
const SPACE_IN_QUOTE_OPEN = /«[ \t]+/g
const SPACE_IN_QUOTE_CLOSE = /[ \t]+»/g
const WHITESPACE_RUN = /\s+/g

/**
 * نرمال‌سازی نوشتاری متن شعر برای نمایش.
 * این تابع برخلاف normalizeText ساختار (فاصله و شکست خط) را دست نمی‌زند.
 */
export function normalizePoemTypography(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/‚/g, "،")
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[ةۀ]/g, "ه")
    .replace(JUNK_GLYPHS, "")
    .replace(SPECIAL_MARKS, "")
    .replace(/\u00a0/g, " ")
    .replace(SPACE_BEFORE_PUNCT, "$1")
    .replace(SPACE_AFTER_PUNCT, "$1 ")
    .replace(SPACE_IN_QUOTE_OPEN, "«")
    .replace(SPACE_IN_QUOTE_CLOSE, "»")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/**
 * تحلیل یک‌بارهٔ متن خام: نرمال‌سازی نوشتاری، تفکیک شکست خط‌های واقعی
 * و ساخت شکل یک‌خطی. این کار در زمان بارگذاری انجام می‌شود، نه در هر درخواست.
 */
export function analyzePoem(raw: string): PoemSource {
  const trimmed = raw.trim()
  const normalized = normalizePoemTypography(trimmed)
  if (!normalized) return { raw: trimmed, lines: [], hasBreaks: false, flat: "" }

  const marked = normalized
    .replace(STANZA_RUN, ` ${STANZA_MARK} `)
    .replace(WIDE_SPACE_RUN, LINE_MARK)

  const lines: string[] = []
  let hasBreaks = false
  let cursor = 0
  let buffer = ""

  const push = (value: string) => {
    const text = value.replace(WHITESPACE_RUN, " ").trim()
    if (text) lines.push(text)
  }

  MARK_SCAN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = MARK_SCAN.exec(marked)) !== null) {
    buffer += marked.slice(cursor, match.index)
    cursor = match.index + match[0].length
    push(buffer)
    buffer = ""
    hasBreaks = true
    if (match[0].includes(STANZA_MARK)) {
      // بند تازه با یک سطر خالی جدا می‌شود
      if (lines.length > 0 && lines[lines.length - 1] !== "") lines.push("")
    }
  }
  buffer += marked.slice(cursor)
  push(buffer)

  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
  while (lines.length > 0 && lines[0] === "") lines.shift()

  const flat = marked.replace(MARK_RUN, " ").replace(WHITESPACE_RUN, " ").trim()

  return { raw: trimmed, lines: hasBreaks ? lines : [], hasBreaks, flat }
}

// ---------------------------------------------------------------------------
// بازسازی تقریبی سطرها
// ---------------------------------------------------------------------------

/** طول هدف هر سطر بر پایهٔ شیوهٔ رایج شعر نو فارسی. */
const TARGET_LINE_LENGTH = 24
/** کوتاه‌ترین سطر مجاز در میانهٔ شعر. */
const MIN_LINE_LENGTH = 8
/** بلندترین سطر مجاز؛ از این بیشتر چشم خواننده خسته می‌شود. */
const MAX_LINE_LENGTH = 64
/** اگر متن از این کوتاه‌تر باشد، بازسازی انجام نمی‌شود. */
const MIN_TOKENS_FOR_REFLOW = 12

// واژه‌هایی که نمی‌توانند پایان سطر باشند چون به واژهٔ بعد می‌چسبند.
const INSEPARABLE_END = new Set(["می", "نمی", "بی"])
// واژه‌هایی که سطر نمی‌تواند با آن‌ها آغاز شود (شکست پیش از آن‌ها ممنوع است).
const INSEPARABLE_START = new Set(["را", "است", "هست", "نیست", "بود", "شد", "تر", "می", "نمی", "بی"])

/** واژه‌هایی که پایان سطر با آن‌ها ناخوشایند است، اما ممنوع نیست. */
const AWKWARD_LINE_END = new Set([
  "و", "که", "به", "از", "در", "با", "تا", "بر", "این", "آن", "یک",
  "چه", "اگر", "نه", "ولی", "اما", "چون", "یا", "نیز", "همان", "چنین",
  "مرا", "ترا", "او", "ما", "شما", "آنها", "مگر", "زیرا",
])

/** نشانه‌هایی که پایان سطر را طبیعی می‌کنند. */
const GOOD_LINE_END = new Set(["،", "؛", "؟", "!", ":", "…"])

const LEADING_MARKS = /^[«("'\[]+/
const TRAILING_MARKS = /[،؛؟!:.…»)"'\]]+$/

/** واژه بدون نشانه‌گذاری لبه، برای بررسی‌های پیوند دستوری. */
function bareToken(token: string): string {
  return token.replace(LEADING_MARKS, "").replace(TRAILING_MARKS, "")
}

const AWKWARD_END_PENALTY = 4
const GOOD_END_BONUS = 2
const LONG_LINE_SLACK = 1.7

/**
 * بازسازی سطرها با کمینه‌سازی هزینهٔ طول.
 *
 * ایده: سطرهای شعر نو فارسی طولی نزدیک به هم دارند. یک برنامه‌ریزی پویا روی
 * مرزهای واژه سطری می‌سازد که انحراف طولش از طول هدف کم باشد، میان واژه و
 * پیوندش نشکند و ترجیحاً روی نشانه‌گذاری تمام شود. هیچ واژه‌ای حذف یا شکسته
 * نمی‌شود؛ فقط مرز سطرها جابه‌جا می‌شود.
 */
export function reconstructLines(text: string): string[] {
  const tokens = text.split(WHITESPACE_RUN).filter(Boolean)
  const count = tokens.length
  if (count < MIN_TOKENS_FOR_REFLOW) return tokens.length ? [tokens.join(" ")] : []

  // ویژگی‌های زبانی هر واژه یک بار پیش از برنامه‌ریزی پویا محاسبه می‌شوند تا
  // حلقهٔ داخلی فقط شامل حساب و مقایسه باشد.
  const lengths = new Int32Array(count)
  const blockedEndBefore = new Uint8Array(count)
  const blockedStartAt = new Uint8Array(count)
  const awkwardEnd = new Uint8Array(count)
  const goodEnd = new Uint8Array(count)

  for (let i = 0; i < count; i++) {
    const token = tokens[i]
    const bare = bareToken(token)
    lengths[i] = token.length
    blockedStartAt[i] = INSEPARABLE_START.has(bare) ? 1 : 0
    blockedEndBefore[i] = INSEPARABLE_END.has(bare) ? 1 : 0
    awkwardEnd[i] = AWKWARD_LINE_END.has(bare) ? 1 : 0
    goodEnd[i] = GOOD_LINE_END.has(token[token.length - 1]) ? 1 : 0
  }

  const maxTokensPerLine = Math.max(1, Math.ceil(MAX_LINE_LENGTH / 4) + 4)
  const best = new Float64Array(count + 1).fill(Infinity)
  const from = new Int32Array(count + 1).fill(-1)
  best[0] = 0

  for (let end = 1; end <= count; end++) {
    let length = 0
    const floor = Math.max(0, end - maxTokensPerLine)

    for (let start = end - 1; start >= floor; start--) {
      length += lengths[start] + (start < end - 1 ? 1 : 0)
      if (length > MAX_LINE_LENGTH && start < end - 1) break
      const base = best[start]
      if (base === Infinity) continue
      // مرز سطر نباید یک واژه را از پیوندش جدا کند.
      if (start > 0 && (blockedStartAt[start] || blockedEndBefore[start - 1])) continue

      let cost = base + (length - TARGET_LINE_LENGTH) ** 2
      if (length > LONG_LINE_SLACK * TARGET_LINE_LENGTH) {
        const excess = length - LONG_LINE_SLACK * TARGET_LINE_LENGTH
        cost += 3 * excess * excess
      }
      if (start > 0 && length < MIN_LINE_LENGTH) cost += 120

      if (start < count - 1) {
        if (awkwardEnd[start]) cost += AWKWARD_END_PENALTY * length
        if (goodEnd[start]) cost -= GOOD_END_BONUS * length
      }

      if (cost < best[end]) {
        best[end] = cost
        from[end] = start
      }
    }

    // هیچ مرز مجازی نماند؛ حداقل یک واژه در سطر می‌گذاریم تا متن گم نشود.
    if (from[end] === -1) {
      from[end] = end - 1
      best[end] = best[end - 1] + (lengths[end - 1] - TARGET_LINE_LENGTH) ** 2
    }
  }

  const out: string[] = []
  let cursor = count
  while (cursor > 0) {
    const start = from[cursor]
    out.push(tokens.slice(start, cursor).join(" "))
    cursor = start
  }
  out.reverse()
  return out
}

// ---------------------------------------------------------------------------
// لایهٔ نمایش
// ---------------------------------------------------------------------------

function layoutFromSource(source: PoemSource, mode: LineMode): PoemLayout {
  if (mode === "raw") {
    const lines = source.raw
      .split("\n")
      .map((line) => line.replace(WHITESPACE_RUN, " ").trim())
      .filter(Boolean)
    return { text: source.raw, lines, origin: "raw", lineCount: lines.length }
  }

  if (source.hasBreaks) {
    const lines = source.lines
    return {
      text: lines.join("\n"),
      lines,
      origin: "separators",
      lineCount: lines.filter(Boolean).length,
    }
  }

  if (mode === "separators") {
    return {
      text: source.flat,
      lines: source.flat ? [source.flat] : [],
      origin: "flat",
      lineCount: source.flat ? 1 : 0,
    }
  }

  const rebuilt = reconstructLines(source.flat)
  return {
    text: rebuilt.join("\n"),
    lines: rebuilt,
    origin: rebuilt.length > 1 ? "reconstructed" : "flat",
    lineCount: rebuilt.length,
  }
}

/**
 * ساخت متن نمایشی برای یک شعر از روی متن خام.
 * برای متن‌هایی که یک بار تحلیل شده‌اند، analyzePoem و layoutFromSource مستقیم صدا زده می‌شوند.
 */
export function layoutPoem(raw: string, mode: LineMode = "auto"): PoemLayout {
  const source = analyzePoem(raw)
  if (!source.flat) return { text: "", lines: [], origin: mode === "raw" ? "raw" : "flat", lineCount: 0 }
  return layoutFromSource(source, mode)
}

/** ساخت متن نمایشی از نتیجهٔ تحلیل‌شده. */
export function layoutAnalyzedPoem(source: PoemSource, mode: LineMode = "auto"): PoemLayout {
  return layoutFromSource(source, mode)
}
