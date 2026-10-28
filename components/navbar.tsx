"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Search, X, Github, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const navLinks = [
    { name: "معرفی", href: "/" },
    { name: "ابزارهای دانشگاهی", href: "/#academic-tools" },
    { name: "گردونهٔ بحور", href: "/#metres" },
    { name: "طرح درس", href: "/#syllabus" },
    { name: "مستندات", href: "/docs" },
    { name: "نمونه کدها", href: "/examples" },
    { name: "ویجت", href: "/embed" },
    { name: "مشارکت", href: "/contribute" },
  ]

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-colors border-b ${
          scrolled
            ? "bg-background/95 backdrop-blur-md border-border shadow-2xs"
            : "bg-background/80 backdrop-blur-xs border-border/70"
        }`}
      >
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-base md:text-lg font-bold tracking-tight text-foreground hover:text-foreground/80 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                API اشعار فارسی
              </Link>

              {/* ناوبری دسکتاپ */}
              <nav className="hidden md:flex items-center gap-1 text-xs md:text-sm font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* بخش ابزارهای کناری دسکتاپ */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("command-bar:open"))}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs transition-colors"
                aria-label="جستجوی سریع"
                title="جستجوی سراسری (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5" />
                <span>جستجو...</span>
                <kbd className="text-[10px] font-mono bg-background border border-border/80 rounded px-1 text-muted-foreground">
                  Ctrl K
                </kbd>
              </button>

              <div className="w-px h-4 bg-border/80 mx-1"></div>

              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  aria-label="تغییر حالت تیره و روشن"
                  title="تغییر پوسته"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              )}

              <a
                href="https://github.com/arsamadineh/Persian-Quote-API"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="مخزن گیت‌هاب"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Github className="w-4 h-4" />
                </Button>
              </a>
            </div>

            {/* کنترل‌های موبایل */}
            <div className="md:hidden flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => window.dispatchEvent(new CustomEvent("command-bar:open"))}
                aria-label="جستجوی سریع"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="منوی ناوبری"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* منوی ساده و خوانای موبایل */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[49px] z-40 bg-background/95 backdrop-blur-md md:hidden flex flex-col border-b border-border p-4">
          <nav className="flex flex-col gap-1 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <a
              href="https://github.com/arsamadineh/Persian-Quote-API"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground"
            >
              <Github className="w-4 h-4" />
              گیت‌هاب
            </a>
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="inline-flex items-center gap-1.5 hover:text-foreground"
              >
                {resolvedTheme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4" />
                    پوسته روشن
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    پوسته تیره
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
