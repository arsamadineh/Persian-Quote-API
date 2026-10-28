// packages/arud/src/meters.ts
// Classical Persian meters (بحور عروض فارسی) with both repeating foot patterns
// and full hemistich templates for high-precision scansion.

export interface Meter {
  name: string;
  foot: string;
  footPattern: string;
  afail?: string;
  rhythm?: string;
  description?: string;
  fullPatterns?: string[];
  substitutions: string[];
}

export const METERS: Meter[] = [
  {
    name: "بحر متقارب",
    foot: "فعولن",
    footPattern: "SLL",
    afail: "فعولن فعولن فعولن فعل",
    rhythm: "U - - | U - - | U - - | U -",
    description: "متقارب مثمن محذوف؛ وزن حماسی شاهنامه فردوسی، بوستان و گلستان سعدی.",
    fullPatterns: [
      "SLLSLLSLLSL",   // فعولن فعولن فعولن فعل (۱۱ هجا)
      "SLLSLLSLLSLL",  // فعولن فعولن فعولن فعولن (۱۲ هجا)
    ],
    substitutions: ["حذف", "قصر", "خبن"],
  },
  {
    name: "بحر هزج",
    foot: "مفاعیلن",
    footPattern: "SLLL",
    afail: "مفاعیلن مفاعیلن فعولن",
    rhythm: "U - - - | U - - - | U - -",
    description: "هزج مسدس محذوف یا مثمن سالم؛ وزن منظومه‌های غنایی نظامی و غزلیات کلاسیک.",
    fullPatterns: [
      "SLLLSLLLSLL",      // مفاعیلن مفاعیلن فعولن (۱۱ هجا)
      "SLLLSLLLSLLLSLLL", // مفاعیلن مفاعیلن مفاعیلن مفاعیلن (۱۶ هجا)
      "LLSLLLSLLLSLL",    // مفعول مفاعیل مفاعیل فعل — وزن رباعی (۱۳ هجا)
      "LLSLLLSLLLSLLL",   // مفعول مفاعیلن مفعول مفاعیلن (۱۴ هجا)
    ],
    substitutions: ["حذف", "قصر", "خرب", "کف"],
  },
  {
    name: "بحر رمل",
    foot: "فاعلاتن",
    footPattern: "LSLL",
    afail: "فاعلاتن فاعلاتن فاعلن",
    rhythm: "- U - - | - U - - | - U -",
    description: "رمل مسدس یا مثمن محذوف؛ وزن مثنوی معنوی مولانا و بسیاری از غزلیات فارسی.",
    fullPatterns: [
      "LSLLLSLLLSL",      // فاعلاتن فاعلاتن فاعلن (۱۱ هجا - مثنوی معنوی)
      "LSLLLSLLLSLLLSL",  // فاعلاتن فاعلاتن فاعلاتن فاعلن (۱۵ هجا)
      "SSLLSSLLSSLLSSL",  // فعلاتن فعلاتن فعلاتن فعلن (۱۵ هجا)
      "LSLLSSLLSSLLSSL",  // فاعلاتن فعلاتن فعلاتن فعلن (۱۵ هجا)
    ],
    substitutions: ["خبن", "حذف", "شکل", "قصر"],
  },
  {
    name: "بحر مضارع",
    foot: "مفعول فاعلات",
    footPattern: "LLSLSLS",
    afail: "مفعول فاعلات مفاعیل فاعلن",
    rhythm: "- - U | - U - U | U - - U | - U -",
    description: "مضارع مثمن اخرب مکفوف محذوف؛ پرکاربردترین وزن در غزلیات حافظ و سعدی.",
    fullPatterns: [
      "LLSLSLSLLSLSL",   // مفعول فاعلات مفاعیل فاعلن (۱۳ هجا)
      "LLSLSLSLLSLSLL",  // مفعول فاعلات مفاعیل فاعلاتن (۱۴ هجا)
    ],
    substitutions: ["خرب", "کف", "حذف"],
  },
  {
    name: "بحر مجتث",
    foot: "مفاعلن فعلاتن",
    footPattern: "SLSLSSLL",
    afail: "مفاعلن فعلاتن مفاعلن فعلن",
    rhythm: "U - U - | U U - - | U - U - | U U -",
    description: "مجتث مثمن مخبون محذوف؛ از لطیف‌ترین و رایج‌ترین اوزان غزل فارسی.",
    fullPatterns: [
      "SLSLSSLLSLSLSSL", // مفاعلن فعلاتن مفاعلن فعلن (۱۵ هجا)
    ],
    substitutions: ["خبن", "حذف", "تشعیث"],
  },
  {
    name: "بحر خفیف",
    foot: "فعلاتن مفاعلن",
    footPattern: "SSLLSLSL",
    afail: "فعلاتن مفاعلن فعلن",
    rhythm: "U U - - | U - U - | U U -",
    description: "خفیف مسدس مخبون محذوف؛ وزن حدیقةالحقیقه سنایی و غزلیات عارفانه.",
    fullPatterns: [
      "SSLLSLSLSSL", // فعلاتن مفاعلن فعلن (۱۱ هجا)
      "LSLLSLSLSSL", // فاعلاتن مفاعلن فعلن (۱۱ هجا)
    ],
    substitutions: ["خبن", "حذف", "تشعیث"],
  },
  {
    name: "بحر رجز",
    foot: "مستفعلن",
    footPattern: "LLSL",
    afail: "مستفعلن مستفعلن مستفعلن مستفعلن",
    rhythm: "- - U - | - - U - | - - U - | - - U -",
    description: "رجز مثمن سالم یا مخبون؛ وزن موزون و ضرب‌آهنگین در غزل و قصیده.",
    fullPatterns: [
      "LLSLLLSLLLSLLLSL", // مستفعلن مستفعلن مستفعلن مستفعلن (۱۶ هجا)
      "SLSLSLSLSLSLSLSL", // مفاعلن مفاعلن مفاعلن مفاعلن (۱۶ هجا)
    ],
    substitutions: ["خبن", "طی"],
  },
  {
    name: "بحر منسرح",
    foot: "مفتعلن فاعلن",
    footPattern: "LSSL",
    afail: "مفتعلن فاعلن مفتعلن فاعلن",
    rhythm: "- U U - | - U - | - U U - | - U -",
    description: "منسرح مثمن مطوی؛ وزن پویا و موسیقایی در غزلیات مولوی و حافظ.",
    fullPatterns: [
      "LSSLLSLLSSLLSL", // مفتعلن فاعلن مفتعلن فاعلن (۱۴ هجا)
    ],
    substitutions: ["طی", "نحر", "کشف"],
  },
];

export function normalizePattern(p: string): string {
  return p.replace(/\s+/g, "");
}
