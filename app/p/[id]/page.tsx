import { engine } from "@/lib/core-engine"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { PoemReaderView } from "@/components/poem-reader-view"

function toPersianDigits(num: number | string): string {
  return String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] || d)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const res = await engine.fetch(
    new Request(`http://localhost/v1/works/${encodeURIComponent(id)}?view=full`)
  )
  if (!res.ok) {
    return { title: "خوانش شعر" }
  }
  const poem = (await res.json()) as any
  const firstLine = poem.stanzas?.[0]?.[0] || ""
  return {
    title: `${poem.title} — ${poem.poet_name}`,
    description: firstLine
      ? `${poem.title} از ${poem.poet_name}: «${firstLine}» — همراه با تقطیع عروضی، وزن، قافیه و استناد علمی.`
      : `${poem.title} اثر ${poem.poet_name} در گنجینه اشعار فارسی.`,
  }
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

  // Compute adjacent works (prev / next) in the same collection if numbered
  let prevWork: { id: string; title: string } | null = null
  let nextWork: { id: string; title: string } | null = null

  const idParts = String(poem.id || "").split(".")
  if (idParts.length === 3) {
    const prefix = `${idParts[0]}.${idParts[1]}`
    const num = Number(idParts[2])
    if (Number.isFinite(num)) {
      if (num > 1) {
        const prevId = `${prefix}.${num - 1}`
        const pRes = await engine.fetch(new Request(`http://localhost/v1/works/${encodeURIComponent(prevId)}?view=full`))
        if (pRes.ok) {
          const pData = (await pRes.json()) as any
          prevWork = { id: pData.id, title: pData.title || `شعر ${toPersianDigits(num - 1)}` }
        }
      }
      const nextId = `${prefix}.${num + 1}`
      const nRes = await engine.fetch(new Request(`http://localhost/v1/works/${encodeURIComponent(nextId)}?view=full`))
      if (nRes.ok) {
        const nData = (await nRes.json()) as any
        nextWork = { id: nData.id, title: nData.title || `شعر ${toPersianDigits(num + 1)}` }
      }
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Poem",
            name: poem.title,
            author: { "@type": "Person", name: poem.poet_name },
            inLanguage: "fa",
            text: poem.text_plain,
          }),
        }}
      />
      <PoemReaderView poem={poem} prevWork={prevWork} nextWork={nextWork} />
    </>
  )
}
