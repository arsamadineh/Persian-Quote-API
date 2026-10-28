"use client"

import { useState, useTransition, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GraduationCap,
  Scale,
  Search,
  FileText,
  Copy,
  Check,
  ArrowUpRight,
  Layers,
  GitCompare,
  BarChart3,
  BookCheck,
  FileCode,
  Download,
  RotateCcw,
  Code2,
  Play,
  Shuffle,
  ArrowLeftRight,
} from "lucide-react"
import Link from "next/link"
import { scanHemistich } from "@persian-quote/arud"
import {
  cite,
  makeQuiz,
  toMoodleXml,
  toGift,
  toCsv,
  collate,
  collationToTei,
  kwic,
  wordFreq,
} from "@persian-quote/tools"

function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] || d)
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i]![0] = i
  for (let j = 0; j <= n; j++) dp[0]![j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      )
    }
  }
  return dp[m]![n]!
}

function wordDiff(base: string, witness: string): Array<{ type: "eq" | "del" | "ins"; val: string }> {
  const a = base.trim().split(/\s+/).filter(Boolean)
  const b = witness.trim().split(/\s+/).filter(Boolean)
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
    }
  }
  const out: Array<{ type: "eq" | "del" | "ins"; val: string }> = []
  let i = 0, j = 0
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ type: "eq", val: a[i]! })
      i++; j++
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      out.push({ type: "del", val: a[i]! })
      i++
    } else {
      out.push({ type: "ins", val: b[j]! })
      j++
    }
  }
  while (i < m) { out.push({ type: "del", val: a[i]! }); i++; }
  while (j < n) { out.push({ type: "ins", val: b[j]! }); j++; }
  return out
}

// ── نمونه ابیات اصیل فارسی برای تقطیع عروضی ────────────────────────
const SAMPLE_VERSES = [
  {
    poet: "فردوسی (شاهنامه)",
    h1: "به نام خداوند جان و خرد",
    h2: "کزین برتر اندیشه برنگذرد",
    meterHint: "بحر متقارب مثمن محذوف",
  },
  {
    poet: "حافظ (غزل ۲۹۶)",
    h1: "در وفای عشق تو مشهور خوبانم چو شمع",
    h2: "شب نشین کوی سربازان و رندانم چو شمع",
    meterHint: "بحر رمل مثمن محذوف",
  },
  {
    poet: "حافظ (غزلیات)",
    h1: "سحر بلبل حکایت با صبا کرد",
    h2: "که عشق روی گل با ما چه‌ها کرد",
    meterHint: "بحر هزج مسدس محذوف",
  },
  {
    poet: "مولانا (مثنوی معنوی)",
    h1: "بشنو از نی چون حکایت می‌کند",
    h2: "از جدایی‌ها شکایت می‌کند",
    meterHint: "بحر رمل مسدس محذوف",
  },
  {
    poet: "سعدی (گلستان)",
    h1: "بنی‌آدم اعضای یکدیگرند",
    h2: "که در آفرینش ز یک گوهرند",
    meterHint: "بحر متقارب مثمن محذوف",
  },
  {
    poet: "سعدی (غزلیات)",
    h1: "ای ساربان آهسته ران کارام جانم می‌رود",
    h2: "وان دل که با خود داشتم با دلستانم می‌رود",
    meterHint: "بحر رجز مثمن سالم",
  },
]

// ── شواهد مخدوش برای بیت‌یاب ─
const SAMPLE_DAMAGED_VERSES = [
  {
    damaged: "صحبت سالها",
    poet: "مولانا جلال‌الدین بلخی (رومی)",
    real: "کز برای حق صحبت سالها / بازگو حالی از آن خوش حالها",
    id: "molavi.masnavi.2",
  },
  {
    damaged: "در وفای عشق تو مشهور خوبانم",
    poet: "حافظ شیرازی",
    real: "در وفای عشق تو مشهور خوبانم چو شمع / شب نشین کوی سربازان و رندانم چو شمع",
    id: "hafez.ghazaliat.296",
  },
  {
    damaged: "بنی آدم اعظای یک پیکرند",
    poet: "سعدی شیرازی",
    real: "بنی‌آدم اعضای یکدیگرند / که در آفرینش ز یک گوهرند",
    id: "saadi.bustan.2",
  },
  {
    damaged: "اگر ان ترک شیرازی به دست ارد دل ما را",
    poet: "حافظ شیرازی",
    real: "اگر آن ترک شیرازی به دست آرد دل ما را / به خال هندویش بخشم سمرقند و بخارا را",
    id: "hafez.ghazaliat.3",
  },
  {
    damaged: "صلاح کار کجا و من خراب کجا",
    poet: "حافظ شیرازی",
    real: "صلاح کار کجا و من خراب کجا / ببین تفاوت ره کز کجاست تا به کجا",
    id: "hafez.ghazaliat.2",
  },
]

// ── آثار برای استناد علمی ──────────────────────────────────────────
const CITATION_WORKS: Array<{
  id: string
  poetId: string
  poetName: string
  title: string
  collection: string
  kind: "classical" | "modern" | "prose"
}> = [
  { id: "hafez.ghazaliat.296", poetId: "hafez", poetName: "حافظ شیرازی", title: "غزل ۲۹۶", collection: "دیوان حافظ", kind: "classical" },
  { id: "hafez.ghazaliat.2", poetId: "hafez", poetName: "حافظ شیرازی", title: "غزل ۲", collection: "دیوان حافظ", kind: "classical" },
  { id: "ferdowsi.shahnameh.1", poetId: "ferdowsi", poetName: "ابوالقاسم فردوسی", title: "دیباچه (ستایش خرد)", collection: "شاهنامه", kind: "classical" },
  { id: "saadi.golestan.1", poetId: "saadi", poetName: "سعدی شیرازی", title: "باب اول", collection: "گلستان سعدی", kind: "classical" },
  { id: "molavi.masnavi.2", poetId: "rumi", poetName: "مولانا جلال‌الدین بلخی", title: "نی‌نامه", collection: "مثنوی معنوی", kind: "classical" },
  { id: "sepehri.sedayepayeab.1", poetId: "sohrab-sepehri", poetName: "سهراب سپهری", title: "صدای پای آب", collection: "هشت کتاب", kind: "modern" },
]

// ── پیش‌فرض‌های تصحیح انتقادی و مقابله نسخ ───────────
const COLLATION_PRESETS = [
  {
    title: "فردوسی — دیباچه شاهنامه (ستایش خرد)",
    witnesses: [
      { siglum: "خ (خالقی مطلق)", text: "به نام خداوند جان و خرد کزین برتر اندیشه برنگذرد" },
      { siglum: "ف (نسخه فلورانس)", text: "به نام خداوند جان و خرد کزین برتر اندیشه کی بگذرد" },
      { siglum: "م (نسخه مسکو)", text: "به نام خداوند رای و خرد کزان برتر اندیشه برنگذرد" },
    ],
  },
  {
    title: "حافظ — غزل ۲۹۶ (مشهور خوبانم چو شمع)",
    witnesses: [
      { siglum: "ق (قزوینی-غنی)", text: "در وفای عشق تو مشهور خوبانم چو شمع شب نشین کوی سربازان و رندانم چو شمع" },
      { siglum: "خ (خانلری)", text: "در وفای عشق تو مشهور خوبانم چو شمع شب نشین کوی سرمستان و رندانم چو شمع" },
      { siglum: "س (سایه)", text: "در وفای عشق تو مشهور جانانم چو شمع شب نشین کوی سربازان و رندانم چو شمع" },
    ],
  },
  {
    title: "حافظ — غزل ۲ (اگر آن ترک شیرازی)",
    witnesses: [
      { siglum: "ق (قزوینی-غنی)", text: "اگر آن ترک شیرازی به دست آرد دل ما را به خال هندویش بخشم سمرقند و بخارا را" },
      { siglum: "ن (نیساری)", text: "اگر آن ترک شیرازی به دست آرد دل ما را به خال هندویش بخشم سمرقند و بخارا را" },
      { siglum: "س (سایه)", text: "اگر آن شوخ شیرازی به دست آرد دل ما را به خال هندویش بخشم سمرقند و بخارا را" },
    ],
  },
]

// ── پیکره معیار دانشگاهی برای KWIC و بسامد واژگان ─
const ACADEMIC_CORPUS = {
  works: [
    {
      id: "hafez.ghazaliat.296",
      poetId: "hafez",
      poetName: "حافظ شیرازی",
      title: "غزل ۲۹۶",
      stanzas: [
        ["در وفای عشق تو مشهور خوبانم چو شمع", "شب نشین کوی سربازان و رندانم چو شمع"],
        ["روز و شب خوابم نمی‌آید به چشم غم پرست", "بس که در بیماری هجر تو گریانم چو شمع"],
        ["رشته صبرم به مقراض غمت ببریده شد", "همچنان در آتش مهر تو سوزانم چو شمع"],
        ["در میان آب و آتش همچنان سرگرم توست", "این دل زار نزار اشک بارانم چو شمع"],
        ["در شب هجران مرا پروانه وصلی فرست", "ور نه از دردت جهانی را بسوزانم چو شمع"],
        ["کوه صبرم نرم شد چون موم در دست غمت", "تا در آب و آتش عشقت گدازانم چو شمع"],
        ["آتش مهر تو را حافظ عجب در سر گرفت", "آتش دل کی به آب دیده بنشانم چو شمع"],
      ],
      beyts: [
        ["در وفای عشق تو مشهور خوبانم چو شمع", "شب نشین کوی سربازان و رندانم چو شمع"],
        ["روز و شب خوابم نمی‌آید به چشم غم پرست", "بس که در بیماری هجر تو گریانم چو شمع"],
        ["رشته صبرم به مقراض غمت ببریده شد", "همچنان در آتش مهر تو سوزانم چو شمع"],
        ["در میان آب و آتش همچنان سرگرم توست", "این دل زار نزار اشک بارانم چو شمع"],
        ["در شب هجران مرا پروانه وصلی فرست", "ور نه از دردت جهانی را بسوزانم چو شمع"],
        ["کوه صبرم نرم شد چون موم در دست غمت", "تا در آب و آتش عشقت گدازانم چو شمع"],
        ["آتش مهر تو را حافظ عجب در سر گرفت", "آتش دل کی به آب دیده بنشانم چو شمع"],
      ],
    },
    {
      id: "hafez.ghazaliat.2",
      poetId: "hafez",
      poetName: "حافظ شیرازی",
      title: "غزل ۲",
      stanzas: [
        ["اگر آن ترک شیرازی به دست آرد دل ما را", "به خال هندویش بخشم سمرقند و بخارا را"],
        ["بده ساقی می باقی که در جنت نخواهی یافت", "کنار آب رکن‌آباد و گلگشت مصلا را"],
        ["فغان کاین لولیان شوخ شیرین‌کار شهرآشوب", "چنان بردند صبر از دل که ترکان خوان یغما را"],
        ["ز عشق ناتمام ما جمال یار مستغنی است", "به آب و رنگ و خال و خط چه حاجت روی زیبا را"],
        ["حدیث از مطرب و می گو و راز دهر کمتر جو", "که کس نگشود و نگشاید به حکمت این معما را"],
      ],
      beyts: [
        ["اگر آن ترک شیرازی به دست آرد دل ما را", "به خال هندویش بخشم سمرقند و بخارا را"],
        ["بده ساقی می باقی که در جنت نخواهی یافت", "کنار آب رکن‌آباد و گلگشت مصلا را"],
        ["فغان کاین لولیان شوخ شیرین‌کار شهرآشوب", "چنان بردند صبر از دل که ترکان خوان یغما را"],
        ["ز عشق ناتمام ما جمال یار مستغنی است", "به آب و رنگ و خال و خط چه حاجت روی زیبا را"],
        ["حدیث از مطرب و می گو و راز دهر کمتر جو", "که کس نگشود و نگشاید به حکمت این معما را"],
      ],
    },
    {
      id: "saadi.ghazaliat.1",
      poetId: "saadi",
      poetName: "سعدی شیرازی",
      title: "غزل اول",
      stanzas: [
        ["ای ساربان آهسته ران کارام جانم می‌رود", "وان دل که با خود داشتم با دلستانم می‌رود"],
        ["من مانده‌ام مهجور از او بیچاره و رنجور از او", "گویی که نیشی دور از او در استخوانم می‌رود"],
        ["گفتم به نیرنگ و فسون پنهان کنم راز درون", "پنهان نمی‌ماند که خون بر آستانم می‌رود"],
        ["محمل بدار ای ساروان تندی مکن با کاروان", "کز عشق آن سرو روان گویی روانم می‌رود"],
      ],
      beyts: [
        ["ای ساربان آهسته ران کارام جانم می‌رود", "وان دل که با خود داشتم با دلستانم می‌رود"],
        ["من مانده‌ام مهجور از او بیچاره و رنجور از او", "گویی که نیشی دور از او در استخوانم می‌رود"],
        ["گفتم به نیرنگ و فسون پنهان کنم راز درون", "پنهان نمی‌ماند که خون بر آستانم می‌رود"],
        ["محمل بدار ای ساروان تندی مکن با کاروان", "کز عشق آن سرو روان گویی روانم می‌رود"],
      ],
    },
    {
      id: "molavi.masnavi.2",
      poetId: "rumi",
      poetName: "مولانا جلال‌الدین بلخی",
      title: "نی‌نامه و حکایات",
      stanzas: [
        ["بشنو از نی چون حکایت می‌کند", "از جدایی‌ها شکایت می‌کند"],
        ["کز نیستان تا مرا ببریده‌اند", "در نفیرم مرد و زن نالیده‌اند"],
        ["کز برای حق صحبت سالها", "بازگو حالی از آن خوش حالها"],
        ["سینه خواهم شرحه شرحه از فراق", "تا بگویم شرح درد اشتیاق"],
        ["هر کسی کو دور ماند از اصل خویش", "باز جوید روزگار وصل خویش"],
      ],
      beyts: [
        ["بشنو از نی چون حکایت می‌کند", "از جدایی‌ها شکایت می‌کند"],
        ["کز نیستان تا مرا ببریده‌اند", "در نفیرم مرد و زن نالیده‌اند"],
        ["کز برای حق صحبت سالها", "بازگو حالی از آن خوش حالها"],
        ["سینه خواهم شرحه شرحه از فراق", "تا بگویم شرح درد اشتیاق"],
        ["هر کسی کو دور ماند از اصل خویش", "باز جوید روزگار وصل خویش"],
      ],
    },
    {
      id: "ferdowsi.shahnameh.1",
      poetId: "ferdowsi",
      poetName: "ابوالقاسم فردوسی",
      title: "دیباچه شاهنامه",
      stanzas: [
        ["به نام خداوند جان و خرد", "کزین برتر اندیشه برنگذرد"],
        ["خداوند نام و خداوند جای", "خداوند روزی ده رهنمای"],
        ["خداوند کیوان و گردان سپهر", "فروزنده ماه و ناهید و مهر"],
        ["ز نام و نشان و گمان برتر است", "نگارنده بر شده گوهر است"],
        ["توانا بود هر که دانا بود", "ز دانش دل پیر برنا بود"],
      ],
      beyts: [
        ["به نام خداوند جان و خرد", "کزین برتر اندیشه برنگذرد"],
        ["خداوند نام و خداوند جای", "خداوند روزی ده رهنمای"],
        ["خداوند کیوان و گردان سپهر", "فروزنده ماه و ناهید و مهر"],
        ["ز نام و نشان و گمان برتر است", "نگارنده بر شده گوهر است"],
        ["توانا بود هر که دانا بود", "ز دانش دل پیر برنا بود"],
      ],
    },
  ],
}

// ── تشخیص هوشمند قافیه و ردیف ─────────────────────────────────────
function analyzeRhymeAndRadif(h1: string, h2: string) {
  const t1 = h1.trim().split(/\s+/).filter(Boolean)
  const t2 = h2.trim().split(/\s+/).filter(Boolean)
  if (t1.length === 0 || t2.length === 0) {
    return { radif: null, qafiyeh1: null, qafiyeh2: null, rawi: null }
  }

  let matchCount = 0
  while (
    matchCount < t1.length &&
    matchCount < t2.length &&
    t1[t1.length - 1 - matchCount] === t2[t2.length - 1 - matchCount]
  ) {
    matchCount++
  }

  if (matchCount > 0) {
    const radif = t1.slice(t1.length - matchCount).join(" ")
    const qafiyeh1 = t1[t1.length - 1 - matchCount] || null
    const qafiyeh2 = t2[t2.length - 1 - matchCount] || null
    let rawi = null
    if (qafiyeh1 && qafiyeh2) {
      let i = 1
      while (i <= qafiyeh1.length && i <= qafiyeh2.length && qafiyeh1[qafiyeh1.length - i] === qafiyeh2[qafiyeh2.length - i]) {
        i++
      }
      rawi = qafiyeh1.slice(qafiyeh1.length - (i - 1)) || null
    }
    return { radif, qafiyeh1, qafiyeh2, rawi }
  } else {
    const qafiyeh1 = t1[t1.length - 1]!
    const qafiyeh2 = t2[t2.length - 1]!
    let i = 1
    while (i <= qafiyeh1.length && i <= qafiyeh2.length && qafiyeh1[qafiyeh1.length - i] === qafiyeh2[qafiyeh2.length - i]) {
      i++
    }
    const rawi = qafiyeh1.slice(qafiyeh1.length - (i - 1)) || null
    return { radif: null, qafiyeh1, qafiyeh2, rawi }
  }
}

// ── داده‌های سبک‌سنجی آماری (TTR و Burrows Delta) ────────────────
const POET_TTR_DATA = [
  { poet: "سعدی شیرازی", ttr: 0.742, words: 1240, types: 920 },
  { poet: "حافظ شیرازی", ttr: 0.698, words: 1890, types: 1320 },
  { poet: "مولانا بلخی", ttr: 0.685, words: 2450, types: 1680 },
  { poet: "فردوسی", ttr: 0.641, words: 3100, types: 1988 },
]

const DELTA_POETS = ["حافظ", "سعدی", "مولانا", "فردوسی"]
const DELTA_MATRIX: number[][] = [
  [0.0, 0.42, 0.68, 0.94],
  [0.42, 0.0, 0.58, 0.81],
  [0.68, 0.58, 0.0, 0.87],
  [0.94, 0.81, 0.87, 0.0],
]

export function AcademicWorkbench() {
  const [activeTab, setActiveTab] = useState<
    "arud" | "collate" | "kwic" | "freq" | "identify" | "cite" | "quiz" | "console"
  >("arud")

  // ── زبانه ۱: عروض و تقطیع ──────────────────────────────────────────
  const [selectedPresetIdx, setSelectedPresetIdx] = useState("0")
  const [h1Input, setH1Input] = useState(SAMPLE_VERSES[0]!.h1)
  const [h2Input, setH2Input] = useState(SAMPLE_VERSES[0]!.h2)
  const [dualMode, setDualMode] = useState(true)

  const scanH1 = useMemo(() => scanHemistich(h1Input), [h1Input])
  const scanH2 = useMemo(() => (dualMode && h2Input.trim() ? scanHemistich(h2Input) : null), [h2Input, dualMode])
  const rhymeRadif = useMemo(() => (dualMode && h2Input.trim() ? analyzeRhymeAndRadif(h1Input, h2Input) : null), [h1Input, h2Input, dualMode])

  const handleSelectVersePreset = (idx: string) => {
    setSelectedPresetIdx(idx)
    const item = SAMPLE_VERSES[Number(idx)]
    if (item) {
      setH1Input(item.h1)
      setH2Input(item.h2)
    }
  }

  const handleSwapHemistichs = () => {
    const temp = h1Input
    setH1Input(h2Input)
    setH2Input(temp)
  }

  // ── زبانه ۲: تصحیح و مقابله نسخ (Collation & TEI) ──────────────────
  const [collationPresetIdx, setCollationPresetIdx] = useState("0")
  const [customWitnesses, setCustomWitnesses] = useState(COLLATION_PRESETS[0]!.witnesses)
  const [teiCopied, setTeiCopied] = useState(false)

  const collationTable = useMemo(() => collate(customWitnesses), [customWitnesses])
  const teiXml = useMemo(() => collationToTei(collationTable), [collationTable])

  const witnessDiffs = useMemo(() => {
    const baseText = customWitnesses[0]?.text || ""
    return customWitnesses.slice(1).map((w) => ({
      siglum: w.siglum,
      diff: wordDiff(baseText, w.text),
    }))
  }, [customWitnesses])

  const handleCollationPresetChange = (val: string) => {
    setCollationPresetIdx(val)
    const preset = COLLATION_PRESETS[Number(val)]
    if (preset) {
      setCustomWitnesses(preset.witnesses.map((w) => ({ ...w })))
    }
  }

  const handleWitnessTextChange = (idx: number, newText: string) => {
    setCustomWitnesses((prev) =>
      prev.map((w, i) => (i === idx ? { ...w, text: newText } : w))
    )
  }

  const handleCopyTei = () => {
    navigator.clipboard.writeText(teiXml)
    setTeiCopied(true)
    setTimeout(() => setTeiCopied(false), 2000)
  }

  const handleDownloadTei = () => {
    const blob = new Blob([teiXml], { type: "application/xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "collation-apparatus.tei.xml"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── زبانه ۳: نمایه واژگانی در بافت (KWIC) ─────────────────────────
  const [kwicTerm, setKwicTerm] = useState("عشق")
  const [kwicPoetFilter, setKwicPoetFilter] = useState("all")
  const [kwicWindow, setKwicWindow] = useState(5)
  const [kwicSort, setKwicSort] = useState<"right" | "left" | "poet">("right")
  const [kwicCopied, setKwicCopied] = useState(false)

  const kwicRows = useMemo(() => {
    if (!kwicTerm.trim()) return []
    const rows = kwic(ACADEMIC_CORPUS as any, kwicTerm, {
      window: kwicWindow,
      poet: kwicPoetFilter === "all" ? undefined : kwicPoetFilter,
    })
    return rows.sort((a, b) => {
      if (kwicSort === "poet") return (a.workId || "").localeCompare(b.workId || "", "fa")
      if (kwicSort === "left") return (a.left || "").localeCompare(b.left || "", "fa")
      return (a.right || "").localeCompare(b.right || "", "fa")
    })
  }, [kwicTerm, kwicPoetFilter, kwicWindow, kwicSort])

  const handleCopyKwicTsv = () => {
    const tsv = kwicRows.map((r) => `${r.left}\t${r.hit}\t${r.right}\t${r.workId}`).join("\n")
    navigator.clipboard.writeText(tsv)
    setKwicCopied(true)
    setTimeout(() => setKwicCopied(false), 2000)
  }

  // ── زبانه ۴: بسامد و سبک‌سنجی آماری ───────────────────────────────
  const [freqPoet, setFreqPoet] = useState("hafez")
  const [freqStem, setFreqStem] = useState(false)
  const [styloCopied, setStyloCopied] = useState(false)

  const freqData = useMemo(() => {
    return wordFreq(ACADEMIC_CORPUS as any, {
      poet: freqPoet === "all" ? undefined : freqPoet,
      stem: freqStem,
      top: 12,
    })
  }, [freqPoet, freqStem])

  const maxFreq = freqData.length > 0 ? freqData[0]![1] : 1

  const handleCopyStyloJson = () => {
    const json = JSON.stringify(
      {
        corpus: "ACADEMIC_PERSIAN_CORPUS",
        top_words: freqData,
        ttr_metrics: POET_TTR_DATA,
        burrows_delta: {
          poets: DELTA_POETS,
          matrix: DELTA_MATRIX,
        },
      },
      null,
      2
    )
    navigator.clipboard.writeText(json)
    setStyloCopied(true)
    setTimeout(() => setStyloCopied(false), 2000)
  }

  // ── زبانه ۵: بیت‌یاب مخدوش ─────────────────────────────────────────
  const [damagedInput, setDamagedInput] = useState(SAMPLE_DAMAGED_VERSES[0]!.damaged)
  const [searching, startSearchTransition] = useTransition()
  const [matchResult, setMatchResult] = useState<any>(SAMPLE_DAMAGED_VERSES[0])
  const [candidates, setCandidates] = useState<any[]>([SAMPLE_DAMAGED_VERSES[0]])

  const handleSearchDamaged = (query: string) => {
    setDamagedInput(query)
    startSearchTransition(async () => {
      const q = query.trim()
      if (!q) {
        setMatchResult(null)
        setCandidates([])
        return
      }

      // Check presets first
      const foundPreset = SAMPLE_DAMAGED_VERSES.find(
        (v) => v.damaged.includes(q) || q.includes(v.damaged)
      )

      try {
        const res = await fetch(`/v1/search?q=${encodeURIComponent(q)}&limit=5`)
        if (res.ok) {
          const json = await res.json()
          const items = json.items || []
          if (items.length > 0) {
            const mapped = items.map((item: any) => {
              const doc = item.doc || item
              const matchedBeyt = doc.matched_beyt
                ? (Array.isArray(doc.matched_beyt) ? doc.matched_beyt.join(" / ") : String(doc.matched_beyt))
                : (Array.isArray(doc.stanzas?.[0]) ? doc.stanzas[0].join(" / ") : (doc.text_plain || doc.text || ""))
              const dist = levenshtein(q.replace(/\s+/g, ""), matchedBeyt.replace(/\s+/g, ""))
              const sim = Math.max(0.3, Math.min(1.0, 1 - dist / Math.max(q.length, 25)))
              return {
                damaged: q,
                poet: doc.poet_name || doc.poet || "شاعر کلاسیک",
                real: matchedBeyt,
                id: item.id || doc.id,
                score: item.score,
                distance: dist,
                similarity: Number(sim.toFixed(2)),
              }
            })
            setCandidates(mapped)
            setMatchResult(mapped[0])
            return
          }
        }
      } catch {
        // Fallback to preset
      }

      if (foundPreset) {
        setCandidates([foundPreset])
        setMatchResult(foundPreset)
      } else {
        setMatchResult(null)
        setCandidates([])
      }
    })
  }

  const handleRandomDamaged = () => {
    const randomItem = SAMPLE_DAMAGED_VERSES[Math.floor(Math.random() * SAMPLE_DAMAGED_VERSES.length)]!
    handleSearchDamaged(randomItem.damaged)
  }

  // ── زبانه ۶: استناد علمی دانشگاهی ────────────────────────────────
  const [selectedWorkIdx, setSelectedWorkIdx] = useState("0")
  const [beytNumber, setBeytNumber] = useState(1)
  const [citeStyle, setCiteStyle] = useState<"apa-fa" | "chicago-fa" | "bibtex" | "csl-json">("apa-fa")
  const [citeCopied, setCiteCopied] = useState(false)

  const selectedWork = CITATION_WORKS[Number(selectedWorkIdx)] || CITATION_WORKS[0]!
  const citationText = cite(selectedWork, citeStyle, { beyt: beytNumber })

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText)
    setCiteCopied(true)
    setTimeout(() => setCiteCopied(false), 2000)
  }

  // ── زبانه ۷: آزمون‌ساز دانشگاهی ──────────────────────────────────
  const [quizKind, setQuizKind] = useState<"cloze-radif" | "order-hemistichs" | "poet-mc">("cloze-radif")
  const [quizCount, setQuizCount] = useState(4)
  const [quizFmt, setQuizFmt] = useState<"gift" | "moodle">("gift")
  const [quizSeed, setQuizSeed] = useState(42)
  const [quizCopyStatus, setQuizCopyStatus] = useState<string | null>(null)

  const generatedQuizzes = useMemo(() => {
    const list = []
    const worksPool = ACADEMIC_CORPUS.works
    for (let i = 0; i < quizCount; i++) {
      const w = worksPool[i % worksPool.length]!
      list.push(makeQuiz(w as any, quizKind, quizSeed + i * 13))
    }
    return list
  }, [quizCount, quizKind, quizSeed])

  const quizOutputText = useMemo(() => {
    if (quizFmt === "gift") return toGift(generatedQuizzes)
    return toMoodleXml(generatedQuizzes)
  }, [generatedQuizzes, quizFmt])

  const handleCopyQuizOutput = () => {
    navigator.clipboard.writeText(quizOutputText)
    setQuizCopyStatus(quizFmt)
    setTimeout(() => setQuizCopyStatus(null), 2000)
  }

  const handleDownloadQuizFile = () => {
    const ext = quizFmt === "gift" ? "gift" : "xml"
    const blob = new Blob([quizOutputText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `quiz-export-${quizCount}q.${ext}`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(url)
      a.remove()
    }, 200)
  }

  // ── زبانه ۸: کنسول زنده برنامه‌نویسان ─────────────────────────────
  const [consoleEndpoint, setConsoleEndpoint] = useState("/v1/scan?text=به نام خداوند جان و خرد")
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null)
  const [consoleLatency, setConsoleLatency] = useState<number | null>(null)
  const [consoleLoading, setConsoleLoading] = useState(false)

  const handleRunConsole = async () => {
    setConsoleLoading(true)
    const t0 = performance.now()
    try {
      const res = await fetch(consoleEndpoint)
      const json = await res.json()
      setConsoleLatency(Math.max(1, Math.round(performance.now() - t0)))
      setConsoleOutput(JSON.stringify(json, null, 2))
    } catch {
      setConsoleOutput(JSON.stringify({ error: "خطا در برقراری ارتباط با سرور" }, null, 2))
    } finally {
      setConsoleLoading(false)
    }
  }

  return (
    <div id="academic-tools" className="border border-border rounded-xl bg-card overflow-hidden shadow-xs" dir="rtl">
      {/* سربرگ زبانه ابزارهای دانشگاهی */}
      <div className="bg-muted/40 border-b border-border px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-bold text-foreground font-naskh">
              کارگاه پژوهش و ادبیات دانشگاهی
            </h3>
            <Badge variant="outline" className="text-[11px] border-primary/40 text-primary bg-primary/5">
              محیط پیشرفته پردازش شعر
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            ابزارهای علمی عروض رایانشی، مقابله نسخ خطی، نمایه همنشینی، سبک‌سنجی آماری، استناد علمی و کنسول زنده.
          </p>
        </div>

        {/* دکمه‌های ناوبری ۸ ابزار دانشگاهی */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-background border border-border rounded-lg text-xs overflow-x-auto">
          {[
            { id: "arud", label: "عروض و قافیه", icon: Scale },
            { id: "collate", label: "مقابله نسخ و TEI", icon: GitCompare },
            { id: "kwic", label: "نمایه در بافت (KWIC)", icon: Layers },
            { id: "freq", label: "سبک‌سنجی آماری", icon: BarChart3 },
            { id: "identify", label: "بیت‌یاب مخدوش", icon: Search },
            { id: "cite", label: "استناد علمی", icon: FileText },
            { id: "quiz", label: "آزمون و طرح درس", icon: BookCheck },
            { id: "console", label: "کنسول زنده", icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* ── ۱: عروض و تقطیع ────────────────────────────────────────── */}
        {activeTab === "arud" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">کالبدشکافی عروضی و تقطیع هجایی بیت</span>
                <p className="text-[11px] text-muted-foreground">
                  قاعده وصل همزه، تشخیص هجاهای کشیده، انطباق با ۱۲ بحر کلاسیک و ارزیابی هماهنگی وزن دو مصراع.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">شاهد نمونه:</span>
                <Select value={selectedPresetIdx} onValueChange={handleSelectVersePreset}>
                  <SelectTrigger className="w-[200px] text-xs h-8 bg-background">
                    <SelectValue placeholder="یک نمونه را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {SAMPLE_VERSES.map((sv, idx) => (
                      <SelectItem key={idx} value={String(idx)} className="text-xs">
                        {sv.poet}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSwapHemistichs}
                  title="جابه‌جایی مصراع‌ها"
                  className="h-8 px-2 text-xs gap-1 bg-background"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">جابه‌جایی</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">مصراع اول (صدر):</label>
                <input
                  type="text"
                  value={h1Input}
                  onChange={(e) => setH1Input(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-primary/40 text-right"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">مصراع دوم (عجز):</label>
                <input
                  type="text"
                  value={h2Input}
                  onChange={(e) => setH2Input(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-primary/40 text-right"
                  dir="rtl"
                />
              </div>
            </div>

            {/* نتایج تقطیع مصراع‌ها */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-foreground pb-2 border-b border-border/60">
                  <span>تقطیع مصراع اول (صدر):</span>
                  <span className="font-mono text-[11px] text-primary">
                    {toPersianDigits(scanH1.syllables.length)} هجا · وزن: {scanH1.meter || "نامشخص"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center pt-1" dir="rtl">
                  {scanH1.syllables.map((syl, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center justify-center min-w-[32px] px-2 py-1 rounded border text-xs ${
                        syl.weight === "S"
                          ? "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300"
                          : i === scanH1.syllables.length - 1
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      <span className="font-naskh font-medium">{syl.text}</span>
                      <span className="font-mono text-[10px] mt-0.5">
                        {syl.weight === "S" ? "U کوتاه" : i === scanH1.syllables.length - 1 ? "∪ پایانی" : "– بلند"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {scanH2 && (
                <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-foreground pb-2 border-b border-border/60">
                    <span>تقطیع مصراع دوم (عجز):</span>
                    <span className="font-mono text-[11px] text-primary">
                      {toPersianDigits(scanH2.syllables.length)} هجا · وزن: {scanH2.meter || "نامشخص"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center pt-1" dir="rtl">
                    {scanH2.syllables.map((syl, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center min-w-[32px] px-2 py-1 rounded border text-xs ${
                          syl.weight === "S"
                            ? "border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300"
                            : i === scanH2.syllables.length - 1
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        <span className="font-naskh font-medium">{syl.text}</span>
                        <span className="font-mono text-[10px] mt-0.5">
                          {syl.weight === "S" ? "U کوتاه" : i === scanH2.syllables.length - 1 ? "∪ پایانی" : "– بلند"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* نتایج قافیه و ردیف */}
              {rhymeRadif && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg border border-border bg-muted/10 text-xs">
                  <div className="p-2.5 rounded-md bg-background border border-border">
                    <span className="text-muted-foreground block text-[11px]">ردیف بیت:</span>
                    <span className="font-bold text-foreground font-naskh text-sm">
                      {rhymeRadif.radif ? `«${rhymeRadif.radif}»` : "فاقد ردیف"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-background border border-border">
                    <span className="text-muted-foreground block text-[11px]">قافیه مصراع اول:</span>
                    <span className="font-bold text-primary font-naskh text-sm">
                      {rhymeRadif.qafiyeh1 ? `«${rhymeRadif.qafiyeh1}»` : "—"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-background border border-border">
                    <span className="text-muted-foreground block text-[11px]">قافیه مصراع دوم:</span>
                    <span className="font-bold text-primary font-naskh text-sm">
                      {rhymeRadif.qafiyeh2 ? `«${rhymeRadif.qafiyeh2}»` : "—"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-background border border-border">
                    <span className="text-muted-foreground block text-[11px]">حروف اصلی رَوی:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-naskh text-sm">
                      {rhymeRadif.rawi ? `«${rhymeRadif.rawi}»` : "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ۲: مقابله نسخ خطی و TEI ──────────────────────────────── */}
        {activeTab === "collate" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">مقابله نسخ خطی با الگوریتم Needleman-Wunsch و صدور TEI-XML</span>
                <p className="text-[11px] text-muted-foreground">
                  ویرایش مستقیم نسخه‌ها، تفاوتیابی کلمه به کلمه و ساخت دستگاه انتقادی استاندارد.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">نمونه مقابله:</span>
                <Select value={collationPresetIdx} onValueChange={handleCollationPresetChange}>
                  <SelectTrigger className="w-[250px] text-xs h-8 bg-background">
                    <SelectValue placeholder="انتخاب نمونه شاهدها" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {COLLATION_PRESETS.map((p, idx) => (
                      <SelectItem key={idx} value={String(idx)} className="text-xs">
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ویرایشگر زنده شاهدها */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {customWitnesses.map((w, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-background space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>شاهد {toPersianDigits(idx + 1)}: {w.siglum}</span>
                    {idx === 0 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        نسخه مبنا (شاهد اساس)
                      </Badge>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={w.text}
                    onChange={(e) => handleWitnessTextChange(idx, e.target.value)}
                    className="w-full p-2 rounded border border-border/70 bg-muted/20 text-xs font-naskh text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                    dir="rtl"
                  />
                </div>
              ))}
            </div>

            {/* جعبه تفاوتیابی کلمه به کلمه (Diff Viewer) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground block">تفاوتیابی واژگان نسبت به نسخه مبنا:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {witnessDiffs.map((wd, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-muted/15 space-y-1.5 text-xs font-naskh">
                    <div className="text-[11px] text-muted-foreground font-sans font-medium">
                      شاهد {wd.siglum}:
                    </div>
                    <div className="leading-relaxed">
                      {wd.diff.map((seg, si) => {
                        if (seg.type === "eq") return <span key={si} className="text-foreground">{seg.val} </span>
                        if (seg.type === "del") return <span key={si} className="bg-rose-500/20 text-rose-500 px-1 py-0.5 rounded font-bold line-through mx-0.5">{seg.val} </span>
                        return <span key={si} className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded font-bold mx-0.5">{seg.val} </span>
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* جعبه خروجی TEI-XML */}
            <div className="border border-border/80 rounded-lg p-4 bg-muted/15 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">خروجی استاندارد TEI-P5 XML:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleDownloadTei} className="h-7 text-xs gap-1.5 bg-background">
                    <Download className="w-3.5 h-3.5" />
                    <span>دریافت فایل XML</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCopyTei} className="h-7 text-xs gap-1.5 bg-background">
                    {teiCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی کد TEI</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <pre className="p-3.5 rounded-lg bg-background border border-border text-foreground font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all max-h-48" dir="ltr">
                <code>{teiXml}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ── ۳: نمایه واژگانی در بافت (KWIC) ───────────────────────── */}
        {activeTab === "kwic" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">نمایه واژگانی در بافت (KWIC Concordancer)</span>
                <p className="text-[11px] text-muted-foreground">بررسی کاربرد واژه در متون با تفکیک بافت متنی راست، کلمه هدف، و بافت چپ.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">فیلتر شاعر:</span>
                <Select value={kwicPoetFilter} onValueChange={setKwicPoetFilter}>
                  <SelectTrigger className="w-[140px] text-xs h-8 bg-background">
                    <SelectValue placeholder="شاعر" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="all" className="text-xs">همه شاعران</SelectItem>
                    <SelectItem value="hafez" className="text-xs">حافظ شیرازی</SelectItem>
                    <SelectItem value="saadi" className="text-xs">سعدی شیرازی</SelectItem>
                    <SelectItem value="rumi" className="text-xs">مولانا</SelectItem>
                    <SelectItem value="ferdowsi" className="text-xs">فردوسی</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={handleCopyKwicTsv} className="h-8 text-xs gap-1.5 bg-background">
                  {kwicCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{kwicCopied ? "کپی شد" : "کپی به TSV"}</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={kwicTerm}
                  onChange={(e) => setKwicTerm(e.target.value)}
                  placeholder="واژه مورد نظر (مثال: عشق، شمع، صحبت، خرد)..."
                  className="flex-1 px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-naskh focus:outline-none focus:ring-2 focus:ring-primary/40 text-right"
                  dir="rtl"
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span>پنجره:</span>
                  {[3, 5, 8].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setKwicWindow(w)}
                      className={`px-2 py-0.5 rounded border text-xs transition-colors ${
                        kwicWindow === w
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {toPersianDigits(w)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 border-r border-border pr-2">
                  <span>مرتب‌سازی:</span>
                  {[
                    { id: "right", label: "بافت راست" },
                    { id: "left", label: "بافت چپ" },
                    { id: "poet", label: "شاعر" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setKwicSort(s.id as any)}
                      className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                        kwicSort === s.id
                          ? "bg-muted font-bold text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* نتایج همنشینی واژه */}
            <div className="border border-border rounded-lg bg-background overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-xs font-bold text-foreground">
                  شواهد یافت‌شده ({toPersianDigits(kwicRows.length)} مورد برای «{kwicTerm}»):
                </span>
                <span className="text-[11px] text-muted-foreground">
                  مرتب‌شده بر پایه {kwicSort === "right" ? "بافت راست" : kwicSort === "left" ? "بافت چپ" : "شاعر"}
                </span>
              </div>

              {kwicRows.length > 0 ? (
                <div className="space-y-2">
                  {kwicRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border/70 hover:border-primary/40 bg-muted/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 flex items-center justify-center gap-2 font-naskh text-base">
                        <span className="text-muted-foreground text-left flex-1" dir="rtl">
                          {row.left || "—"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-primary/15 text-primary font-bold border border-primary/30">
                          {row.hit}
                        </span>
                        <span className="text-muted-foreground text-right flex-1" dir="rtl">
                          {row.right || "—"}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-2 border-t md:border-t-0 md:border-r border-border/60 pt-2 md:pt-0 md:pr-3">
                        <Link
                          href={`/p/${encodeURIComponent(row.workId)}`}
                          className="text-primary hover:underline font-medium"
                        >
                          مشاهده اثر (سطر {toPersianDigits(row.lineIndex + 1)})
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  موردی برای این واژه با فیلتر جاری یافت نشد. واژه دیگری مانند «عشق»، «شمع»، «صحبت» یا «خرد» را جستجو کنید.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ۴: سبک‌سنجی و بسامد واژگان ─────────────────────────────── */}
        {activeTab === "freq" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">تحلیل بسامد واژگان، تنوع گونه–توکن (TTR) و بوروز دلتا</span>
                <p className="text-[11px] text-muted-foreground">استخراج پرکاربردترین واژگان کلیدی، ریشه‌یابی صرفی و سنجش فاصله سبکی میان شاعران.</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freqStem}
                    onChange={(e) => setFreqStem(e.target.checked)}
                    className="rounded border-border accent-primary"
                  />
                  <span>بن‌واژه‌سازی صرفی</span>
                </label>

                <Button size="sm" variant="outline" onClick={handleCopyStyloJson} className="h-8 text-xs gap-1.5 bg-background">
                  {styloCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{styloCopied ? "کپی شد" : "کپی stylometry.json"}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* نمودار بسامد توزیع زیپف */}
              <div className="border border-border rounded-lg bg-background p-4 space-y-3">
                <span className="text-xs font-bold text-foreground block">۱۲ واژه پربسامد محتوایی در پیکره:</span>
                <div className="space-y-2">
                  {freqData.map(([word, count], idx) => {
                    const pct = Math.round((count / maxFreq) * 100)
                    return (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <span className="w-16 text-right font-naskh text-sm font-semibold text-foreground truncate">
                          {word}
                        </span>
                        <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-left font-mono text-[11px] text-muted-foreground" dir="ltr">
                          {toPersianDigits(count)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* شاخص TTR و تنوع واژگانی */}
              <div className="border border-border rounded-lg bg-background p-4 space-y-3">
                <span className="text-xs font-bold text-foreground block">نسبت گونه به توکن (Type-Token Ratio) به تفکیک شاعر:</span>
                <div className="space-y-2.5">
                  {POET_TTR_DATA.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-naskh font-medium text-foreground">{p.poet}</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400 font-bold" dir="ltr">
                          {p.ttr.toFixed(3)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${p.ttr * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground flex justify-between font-mono" dir="ltr">
                        <span>{toPersianDigits(p.types)} types</span>
                        <span>{toPersianDigits(p.words)} tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ماتریس فاصله بوروز دلتا (Burrows' Delta) */}
            <div className="border border-border rounded-lg bg-background p-4 space-y-3">
              <span className="text-xs font-bold text-foreground block">ماتریس فاصله سبک‌شناختی بوروز دلتا (Burrows' Delta):</span>
              <p className="text-[11px] text-muted-foreground">
                مقدار کمتر نشان‌دهنده نزدیکی سبکی بیشتر است. قطر اصلی صفر است.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-[11px]">
                      <th className="p-2">شاعر</th>
                      {DELTA_POETS.map((p) => (
                        <th key={p} className="p-2 font-naskh font-semibold text-foreground">{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DELTA_POETS.map((p1, i) => (
                      <tr key={p1} className="border-b border-border/30 hover:bg-muted/10">
                        <td className="p-2 font-naskh font-bold text-foreground text-right">{p1}</td>
                        {DELTA_MATRIX[i]!.map((val, j) => (
                          <td
                            key={j}
                            className={`p-2 font-mono text-xs ${
                              i === j
                                ? "text-muted-foreground opacity-50"
                                : val < 0.5
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                                : "text-foreground"
                            }`}
                            dir="ltr"
                          >
                            {i === j ? "—" : val.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ۵: بیت‌یاب مخدوش ───────────────────────────────────────── */}
        {activeTab === "identify" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">بیت‌یاب مخدوش با جستجوی هیبریدی و فاصله لون‌اشتاین</span>
                <p className="text-[11px] text-muted-foreground">
                  بازیابی بیت کامل و اصیل از روی قطعات بریده‌شده، حافظه‌ای ناقص یا دارای غلط‌های املایی.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleRandomDamaged}
                className="h-8 text-xs gap-1.5 bg-background"
              >
                <Shuffle className="w-3.5 h-3.5 text-primary" />
                <span>یک نمونهٔ مخدوش بده</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={damagedInput}
                  onChange={(e) => handleSearchDamaged(e.target.value)}
                  placeholder="مثال: صحبت سالها یا بنی آدم اعظای یک پیکرند..."
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground text-base font-naskh focus:outline-none focus:ring-2 focus:ring-primary/40 text-right"
                  dir="rtl"
                />
              </div>

              {/* نمونه‌های آماده */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs">
                <span className="text-muted-foreground text-[11px]">شواهد آزمایشی:</span>
                {SAMPLE_DAMAGED_VERSES.map((sv, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearchDamaged(sv.damaged)}
                    className="px-2.5 py-1 rounded border border-border bg-muted/20 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-[11px] font-naskh"
                  >
                    «{sv.damaged}»
                  </button>
                ))}
              </div>
            </div>

            {/* نتیجه تطبیق برتر و فهرست کاندیداها */}
            <div className="border border-border/80 rounded-lg p-4 sm:p-5 bg-muted/15 space-y-4">
              {matchResult ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">شاعر شناسایی‌شده:</span>
                      <span className="text-sm font-bold text-foreground font-naskh">
                        {matchResult.poet}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[11px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                      تطبیق قطعی با نسخه مرجع
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">متن اصیل و کامل بازیابی‌شده:</div>
                    <div className="p-4 rounded-lg bg-background border border-border text-foreground font-naskh text-lg leading-loose">
                      {matchResult.real}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-muted-foreground font-mono text-[11px]" dir="ltr">
                      {matchResult.id}
                    </span>
                    <Link
                      href={`/p/${encodeURIComponent(matchResult.id)}`}
                      className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      خواندن کامل اثر و کالبدشکافی عروضی
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* سایر کاندیداها (Top 5 Candidates) */}
                  {candidates.length > 1 && (
                    <div className="pt-4 border-t border-border/60 space-y-2">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        سایر کاندیداهای احتمالی ({toPersianDigits(candidates.length - 1)} مورد):
                      </span>
                      <div className="space-y-1.5">
                        {candidates.slice(1).map((cand, ci) => (
                          <div
                            key={ci}
                            onClick={() => setMatchResult(cand)}
                            className="p-2.5 rounded-lg border border-border/60 bg-background hover:border-primary/40 cursor-pointer transition-colors flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5 truncate max-w-[80%]">
                              <span className="font-naskh text-foreground block truncate">{cand.real}</span>
                              <span className="text-[10px] text-muted-foreground">{cand.poet} — {cand.id}</span>
                            </div>
                            <span className="font-mono text-teal-600 dark:text-teal-400 text-xs shrink-0" dir="ltr">
                              {toPersianDigits(Math.round((cand.similarity || 0.8) * 100))}٪
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {searching ? "در حال بازیابی و انطباق..." : "بیتی با این مشخصات یافت نشد."}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ۶: استناد علمی دانشگاهی ──────────────────────────────── */}
        {activeTab === "cite" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  انتخاب اثر یا دیوان مرجع:
                </label>
                <Select value={selectedWorkIdx} onValueChange={setSelectedWorkIdx}>
                  <SelectTrigger className="w-full text-xs bg-background h-9 border-border">
                    <SelectValue placeholder="یک اثر را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="max-h-64">
                    {CITATION_WORKS.map((w, idx) => (
                      <SelectItem key={idx} value={String(idx)} className="text-xs font-naskh">
                        {w.poetName} — {w.title} ({w.collection})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  شماره بیت مدنظر برای استناد دقیق:
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={beytNumber}
                  onChange={(e) => setBeytNumber(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-mono h-9"
                  dir="ltr"
                />
              </div>
            </div>

            {/* انتخاب‌گر شیوه استناد */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground block">قالب استاندارد استناد:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "apa-fa", label: "APA 7 (فارسی)" },
                  { id: "chicago-fa", label: "Chicago 17 (پاورقی فارسی)" },
                  { id: "bibtex", label: "BibTeX (LaTeX)" },
                  { id: "csl-json", label: "CSL-JSON (Zotero)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCiteStyle(s.id as any)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                      citeStyle === s.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* جعبه پیش‌نمایش و کپی استناد */}
            <div className="border border-border/80 rounded-lg p-4 bg-muted/15 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-xs font-bold text-foreground">کد استناد علمی آماده درج در مقاله یا پایان‌نامه:</span>
                <Button size="sm" variant="outline" onClick={handleCopyCitation} className="h-7 text-xs gap-1.5 bg-background">
                  {citeCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی استناد</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3.5 rounded-lg bg-background border border-border font-mono text-xs overflow-x-auto text-foreground whitespace-pre-wrap select-all">
                {citationText}
              </div>
            </div>
          </div>
        )}

        {/* ── ۷: آزمون‌ساز دانشگاهی ────────────────────────────────── */}
        {activeTab === "quiz" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">آزمون‌ساز خودکار از پیکره دیوان‌ها و صدور Moodle XML / GIFT</span>
                <p className="text-[11px] text-muted-foreground">طراحی سؤالات جای خالی ردیف، ترتیب مصراع‌ها و تشخیص بحر با صدور به سامانه‌های آموزش مجازی.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setQuizSeed((s) => s + 1)} className="h-8 text-xs gap-1 bg-background">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تولید مجدد</span>
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadQuizFile} className="h-8 text-xs gap-1.5 bg-background">
                  <Download className="w-3.5 h-3.5" />
                  <span>بارگیری فایل</span>
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopyQuizOutput} className="h-8 text-xs gap-1.5 bg-background">
                  {quizCopyStatus ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{quizCopyStatus ? "کپی شد" : "کپی خروجی"}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  نوع سؤال:
                </label>
                <Select value={quizKind} onValueChange={(v) => setQuizKind(v as any)}>
                  <SelectTrigger className="w-full text-xs bg-background h-8 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="cloze-radif" className="text-xs">جای خالی ردیف و قافیه</SelectItem>
                    <SelectItem value="order-hemistichs" className="text-xs">مرتب‌سازی مصراع‌ها</SelectItem>
                    <SelectItem value="poet-mc" className="text-xs">تشخیص شاعر و انتساب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  تعداد سؤالات ({toPersianDigits(quizCount)}):
                </label>
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="w-full accent-primary mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  قالب صدور آزمون:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizFmt("gift")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      quizFmt === "gift" ? "border-primary bg-primary text-primary-foreground font-bold" : "border-border bg-background"
                    }`}
                  >
                    GIFT (Moodle)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizFmt("moodle")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                      quizFmt === "moodle" ? "border-primary bg-primary text-primary-foreground font-bold" : "border-border bg-background"
                    }`}
                  >
                    Moodle XML
                  </button>
                </div>
              </div>
            </div>

            {/* کارت‌های پیش‌نمایش سؤالات */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground block">پیش‌نمایش سؤالات طراحی‌شده:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedQuizzes.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-border bg-background space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/50 pb-1.5 font-mono">
                      <span>سؤال {toPersianDigits(idx + 1)} · {q.kind}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-sans">پاسخ: {q.answer}</span>
                    </div>
                    <div className="font-naskh text-sm leading-relaxed text-foreground whitespace-pre-line pt-1">
                      {q.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ۸: کنسول زنده برنامه‌نویسان ───────────────────────────── */}
        {activeTab === "console" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground">کنسول زنده اجرای اندپوینت‌های API</span>
                <p className="text-[11px] text-muted-foreground">اجرای زنده درخواست‌ها و سنجش زمان پاسخ در محیط واقعی بدون نیاز به ابزارهای جانبی.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleRunConsole}
                  disabled={consoleLoading}
                  className="h-8 text-xs gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{consoleLoading ? "در حال دریافت..." : "اجرای زنده"}</span>
                </Button>
              </div>
            </div>

            {/* انتخاب‌گر اندپوینت سریع */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { label: "تقطیع عروضی (/v1/scan)", ep: "/v1/scan?text=به نام خداوند جان و خرد" },
                { label: "جستجوی اشعار (/api/quotes/search)", ep: "/api/quotes/search?q=عشق&limit=3" },
                { label: "جدول بحور (/v1/meters)", ep: "/v1/meters" },
                { label: "فهرست شاعران (/api/poets)", ep: "/api/poets" },
                { label: "غزل ۲۹۶ حافظ (/v1/works)", ep: "/v1/works/hafez.ghazaliat.296?view=full" },
                { label: "آمار موتور (/api/engine/stats)", ep: "/api/engine/stats" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setConsoleEndpoint(item.ep)
                    setConsoleOutput(null)
                    setConsoleLatency(null)
                  }}
                  className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                    consoleEndpoint === item.ep
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-muted/20 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* آدرس بار و ورودی */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/25 border border-border text-xs font-mono" dir="ltr">
              <Badge variant="outline" className="font-mono text-[10px] bg-background font-bold shrink-0">
                GET
              </Badge>
              <input
                type="text"
                value={consoleEndpoint}
                onChange={(e) => setConsoleEndpoint(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-foreground font-mono text-xs"
              />
            </div>

            {/* خروجی پاسخ JSON */}
            <div className="border border-stone-800 rounded-lg overflow-hidden bg-stone-950 text-stone-100 flex flex-col">
              <div className="px-3 py-2 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>application/json; charset=utf-8</span>
                <div className="flex items-center gap-2">
                  {consoleLatency !== null && (
                    <span className="text-emerald-400 font-sans">
                      پاسخ سرور زنده ({toPersianDigits(consoleLatency)} میلی‌ثانیه)
                    </span>
                  )}
                  <span>200 OK</span>
                </div>
              </div>
              <pre className="p-3.5 font-mono text-xs overflow-auto text-left leading-relaxed max-h-[360px] bg-stone-950 text-stone-200" dir="ltr">
                <code>
                  {consoleOutput ||
                    `{\n  "message": "روی دکمه «اجرای زنده» کلیک کنید تا پاسخ واقعی از سرور دریافت و نمایش داده شود."\n}`}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
