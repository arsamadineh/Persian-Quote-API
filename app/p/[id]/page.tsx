import { engine } from '@/lib/core-engine'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'خواندن شعر',
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await engine.fetch(
    new Request(`http://localhost/v1/works/${encodeURIComponent(id)}?view=full`)
  )
  if (!res.ok) notFound()
  const poem = (await res.json()) as any

  const lines = Array.isArray(poem.stanzas) ? poem.stanzas.flat() : []

  return (
    <div className="min-h-screen bg-background text-foreground rtl">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <a href="/" className="hover:text-foreground transition-colors">
            صفحه اصلی
          </a>
          <span>/</span>
          <a href={`/poets/${poem.poet_id}`} className="hover:text-foreground transition-colors">
            {poem.poet_name}
          </a>
          <span>/</span>
          <span>{poem.title}</span>
        </nav>

        <article className="prose prose-lg max-w-none border border-border rounded-lg p-8 bg-card/50">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-right">
            {poem.title}
          </h1>
          <div
            className="text-xl leading-relaxed text-justify text-right font-serif"
            dir="rtl"
            lang="fa"
          >
            {lines.map((line: string, i: number) => (
              <p key={i} className="mb-4 last:mb-0 whitespace-pre-line">
                {line}
              </p>
            ))}
          </div>

          {poem.meter && (
            <div className="mt-8 pt-6 border-t border-border/50 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground mb-1">وزن و قافیه</div>
              <div>{poem.meter.name}</div>
              {poem.qafiyeh && <div>قافیه: {poem.qafiyeh}</div>}
              {poem.radif && <div>ردیف: {poem.radif}</div>}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <a
              href={`/v1/works/${id}?view=text&format=txt`}
              className="px-4 py-2 rounded border border-border hover:bg-muted transition-colors text-xs"
            >
              متن خالی
            </a>
            <a
              href={`/poets/${poem.poet_id}`}
              className="px-4 py-2 rounded border border-border hover:bg-muted transition-colors text-xs"
            >
            تمام اشعار {poem.poet_name}
            </a>
          </div>
        </article>
      </div>
    </div>
  )
}
