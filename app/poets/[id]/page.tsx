import { engine } from '@/lib/core-engine'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'شاعر',
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
          <div className="flex gap-4 text-xs text-muted-foreground mb-4">
            <span>{poet.era}</span>
            {poet.birth && <span>توليد: {poet.birth}</span>}
            {poet.death && <span>وفات: {poet.death}</span>}
            <span>تعداد ابیات: {poet.stats?.works_count ?? 0}</span>
          </div>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
            {poet.bio_persian ?? 'زیربن 그가 در دست assembling است.'}
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4">اشعار منتخب</h2>
          {(worksData.items || []).map((w: any) => (
            <div key={w.id} className="border border-border rounded-lg p-5 bg-card/40 mb-4">
              <h3 className="font-semibold text-foreground mb-2 text-right">
                <a href={`/p/${w.id}`} className="hover:text-primary transition-colors">
                  {w.title}
                </a>
              </h3>
              <div className="text-sm text-muted-foreground leading-relaxed" dir="rtl" lang="fa">
                {(w.stanzas || []).flat().slice(0, 2).join('\n')}
                {w.stanzas?.flat().length! > 2 && <span> …</span>}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
