import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CHANGELOG,
  CHANGE_TYPES,
  type ChangeType,
  type ChangelogEntry,
  type ChangelogVersion,
} from "@/lib/changelog"
import Link from "next/link"

export const metadata = {
  title: "تغییرات - API اشعار فارسی",
  description: "فهرست کامل تغییرات، بهبودها و رفع خطاهای API اشعار فارسی.",
}

function groupByType(entries: ChangelogEntry[]): Array<{ type: ChangeType; items: ChangelogEntry[] }> {
  const groups = new Map<ChangeType, ChangelogEntry[]>()
  for (const entry of entries) {
    if (!groups.has(entry.type)) groups.set(entry.type, [])
    groups.get(entry.type)!.push(entry)
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => CHANGE_TYPES[a].order - CHANGE_TYPES[b].order)
    .map(([type, items]) => ({ type, items }))
}

function VersionSection({ version }: { version: ChangelogVersion }) {
  const groups = groupByType(version.changes)
  return (
    <section className="border-r-2 border-border pr-6 pb-8 last:border-r-0">
      <header className="mb-5">
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <h2 className="text-2xl font-bold text-foreground">نسخه {version.version}</h2>
          <Badge variant="outline" className="font-mono">
            {version.isoDate}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{version.date}</p>
      </header>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.type}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              {CHANGE_TYPES[group.type].label}
            </h3>
            <ul className="space-y-2 pr-4">
              {group.items.map((item, idx) => (
                <li key={idx} className="text-base text-foreground/90 leading-relaxed flex items-start gap-2">
                  <span className="text-muted-foreground mt-2 w-1 h-1 rounded-full bg-muted-foreground/60 shrink-0" />
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <header className="mb-10 pb-6 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">تغییرات</h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            فهرست کامل نسخه‌ها، قابلیت‌های جدید، بهبودها، و رفع خطاهای پروژه. هر تغییر در این
            فهرست در فایل مرجع <code className="px-1.5 py-0.5 bg-muted rounded text-sm" dir="ltr">lib/changelog.ts</code> ثبت شده است.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            برای اطلاع از انتشار نسخه جدید، همین صفحه را به‌صورت دوره‌ای مرور کنید یا ریپازیتوری
            گیت‌هاب را زیر نظر داشته باشید.
            {" "}
            <Link href="/" className="text-foreground hover:underline">
              بازگشت به خانه
            </Link>
          </p>
        </header>

        <Card>
          <CardContent className="pt-6 space-y-2">
            {CHANGELOG.map((version) => (
              <VersionSection key={version.version} version={version} />
            ))}
          </CardContent>
        </Card>

        {/* Support Section */}
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-3">حمایت از توسعه</h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            این پروژه به‌طور کامل توسط <span className="font-semibold text-foreground">آرسام آدینه</span> ساخته و تامین مالی شده و به‌صورت رایگان در دسترس عموم قرار گرفته است.
            اگر این پروژه برایتان مفید بود، با خرید یک قهوه می‌توانید از ادامه توسعه و نگهداری آن حمایت کنید.
          </p>
          <a href="https://www.coffeebede.com/arsamadineh">
            <img
              className="img-fluid"
              src="https://coffeebede.ir/DashboardTemplateV2/app-assets/images/banner/default-yellow.svg"
              alt="خرید قهوه برای توسعه‌دهنده"
            />
          </a>
        </section>
      </div>
    </div>
  )
}
