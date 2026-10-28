'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Copy } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const search = useCallback(async () => {
    if (!query.trim()) {
      setResults([])
      setTotal(0)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `/v1/search?q=${encodeURIComponent(query)}&limit=20`
      )
      const json = await res.json()
      setResults(json.items || [])
      setTotal(json.total || 0)
    } catch {
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    const t = setTimeout(search, 300)
    return () => clearTimeout(t)
  }, [query, search])

  const copy = (id: string) => {
    navigator.clipboard.writeText(`${location.origin}/p/${id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-background text-foreground rtl">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-10 border border-border rounded-lg p-6 bg-card/50">
          <h1 className="text-2xl font-bold text-foreground mb-4 text-right">
            جستجوی اشعار
          </h1>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              id="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="واژه جستجو (عشق، حافظ، شیراز…)"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-right"
              dir="rtl"
              lang="fa"
            />
            <button
              onClick={search}
              disabled={loading}
              className="px-6 py-3 rounded-lg border border-border bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              {loading ? 'در حال جستجو…' : 'جستجو'}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            جستجو در عنوان، متن، نام شاعر و تگ‌ها. پشتیبانی از finglish (مثل: eshgh → عشق).
          </p>
        </div>

        {loading && <p className="text-muted-foreground text-right mb-6">در حال بارگذاری…</p>}

        {results.length === 0 && !loading && total === 0 && query.trim() && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>نتیجه‌ای برای «{query}» یافت نشد.</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((poem: any) => {
            const doc = poem.doc || poem
            return (
              <div
                key={poem.id}
                className="border border-border rounded-lg p-5 bg-card/40 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-foreground text-right">
                    <Link href={`/p/${poem.id}`} className="hover:text-primary transition-colors">
                      {doc.title || poem.title}
                    </Link>
                  </h3>
                  <span className="text-[10px] px-2 py-1 rounded border border-border/50 text-muted-foreground">
                    {doc.form || poem.form}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-3 text-right" dir="rtl" lang="fa">
                  {(doc.text_plain || poem.text_plain)?.slice(0, 200)}
                  {(doc.text_plain || poem.text_plain)?.length! > 200 ? '…' : ''}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{doc.poet_name || poem.poet_name}</span>
                  <span>/</span>
                  <span>{doc.collection_title || poem.collection_title}</span>
                  <button
                    onClick={() => copy(poem.id)}
                    title="کپی پیوند"
                    className="hover:text-primary transition-colors"
                  >
                    {copied ? <Copy className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {total > 0 && (
          <div className="mt-8 text-xs text-muted-foreground text-right border-t border-border/50 pt-4">
            {total} نتیجه یافت شد
          </div>
        )}
      </div>
    </div>
  )
}
