import { engine } from '@/lib/core-engine'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'شاعر',
}

const ERA_NAMES: Record<string, string> = {
  pre_islamic: 'پیش از اسلام',
  early_islamic: 'قرون نخستین اسلامی',
  seljuk: 'دوره سلجوقی',
  khwarazmian: 'دوره خوارزمشاهی',
  ilkhanate: 'دوره ایلخانی',
  timurid: 'دوره تیموری',
  safavid: 'دوره صفوی',
  afsharid_zand: 'افشاریه و زندیه',
  qajar: 'دوره قاجار',
  constitutional: 'دوره مشروطه',
  pahlavi: 'دوره پهلوی',
  contemporary: 'معاصر',
}

function formatDate(date: any): string | null {
  if (!date) return null
  if (typeof date === 'number' || typeof date === 'string') {
    return String(date)
  }
  if (typeof date === 'object') {
    let text = ''
    if (date.year_jalali) {
      text = `${date.year_jalali} خورشیدی`
    } else if (date.year_gregorian) {
      text = `${date.year_gregorian} میلادی`
    } else if (date.century_hijri) {
      text = `سده ${date.century_hijri} هجری`
    }
    if (date.place) {
      text = text ? `${text} (${date.place})` : date.place
    }
    return text || null
  }
  return null
}

export default async function PoetPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await engine.fetch(new Request(`http://localhost/v1/poets/${encodeURIComponent(id)}`))
  if (!res.ok) notFound()
  const poet = (await res.json()) as any

  // Fetch poet's works
  const worksRes = await engine.fetch(
    new Request(`http://localhost/v1/works?poet=${encodeURIComponent(id)}&limit=10`)
  )
  const worksData = (await worksRes.json()) as any

  const birthStr = formatDate(poet.birth)
  const deathStr = formatDate(poet.death)
  const eraStr = poet.era ? (ERA_NAMES[poet.era] || poet.era) : null

  return (
    <div className="min-h-screen bg-background text-foreground rtl">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">
            صفحه اصلی
          </a>
          <span>/</span>
          <span>{poet.name_persian}</span>
        </nav>

        <header className="mb-10 border border-border rounded-lg p-8 bg-card/50 text-right">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {poet.name_persian}
          </h1>
          {poet.name_english && (
            <p className="text-sm text-muted-foreground font-mono mb-2">{poet.name_english}</p>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
            {eraStr && <span>{eraStr}</span>}
            {birthStr && <span>تولد: {birthStr}</span>}
            {deathStr && <span>وفات: {deathStr}</span>}
            <span>تعداد ابیات: {poet.stats?.works_count ?? 0}</span>
          </div>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            {poet.bio_persian ?? 'زندگی‌نامه و شرح احوال این شاعر به زودی تکمیل خواهد شد.'}
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">اشعار منتخب</h2>
          {(worksData.items || []).map((w: any) => {
            const lines = (w.stanzas || []).flat()
            return (
              <div key={w.id} className="border border-border rounded-lg p-5 bg-card/40 mb-4">
                <h3 className="font-semibold text-foreground mb-2 text-right">
                  <a href={`/p/${w.id}`} className="hover:text-primary transition-colors">
                    {w.title}
                  </a>
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line" dir="rtl" lang="fa">
                  {lines.slice(0, 2).join('\n')}
                  {lines.length > 2 && <span> …</span>}
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  )
}
