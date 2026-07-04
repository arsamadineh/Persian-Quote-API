"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Code, Menu, PenTool, Search, X, ChevronLeft, Github, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Add scroll effect for glassmorphism intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  const navLinks = [
    { name: "خانه", href: "/" },
    { name: "مستندات", href: "/docs" },
    { name: "نمونه‌ها", href: "/examples" },
    { name: "ویجت", href: "/embed" },
    { name: "ساختار", href: "/sakhtar" },
  ]

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled 
            ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-sm" 
            : "bg-background/50 backdrop-blur-md border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              API اشعار فارسی
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3 lg:gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className="relative font-medium text-foreground/80 hover:text-primary transition-colors py-2 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
                </Link>
              ))}
              
              {/* دکمه جستجوي سراسري */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("command-bar:open"))}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/50 hover:bg-muted/40 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-200 group"
                aria-label="باز کردن جستجوی سراسری"
                title="جستجوی سراسری (Ctrl K)"
              >
                <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                <span className="text-[11px]">جستجو...</span>
                <kbd className="text-[10px] font-mono bg-muted border border-border rounded px-1 py-0 group-hover:border-primary/30 mr-1">Ctrl K</kbd>
              </button>

              <Link href="/contribute" className="font-medium text-foreground/80 hover:text-primary transition-colors py-2 group flex items-center gap-1.5 relative">
                <PenTool className="w-4 h-4 group-hover:scale-110 transition-transform" />
                مشارکت
                <span className="absolute bottom-0 right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
              </Link>
              
              <div className="w-px h-6 bg-border mx-2"></div>

              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full w-9 h-9 text-foreground/80 hover:text-primary transition-all duration-300"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  title="تغییر پوسته"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-4.5 h-4.5 text-amber-500" />
                  ) : (
                    <Moon className="w-4.5 h-4.5 text-primary" />
                  )}
                </Button>
              )}
              
              <div className="w-px h-6 bg-border mx-2"></div>
              
              <a href="https://github.com/arsamadineh/Persian-Quote-API" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="persian-button bg-transparent border-primary/20 hover:border-primary/50 hover:bg-primary/5 group transition-all duration-300 rounded-full px-5">
                  <Github className="w-4 h-4 ml-2 group-hover:text-primary transition-colors" />
                  گیت‌هاب
                </Button>
              </a>
            </nav>
            
            {/* دکمه‌هاي موبايل */}
            <div className="md:hidden flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10 text-foreground hover:bg-primary/10 active:scale-95 transition-transform"
                onClick={() => window.dispatchEvent(new CustomEvent("command-bar:open"))}
                aria-label="جستجوی سراسری"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-[60] text-foreground hover:bg-primary/10 rounded-full w-10 h-10 transition-transform duration-300 active:scale-95"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="منو"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Extreme Mobile Menu */}
      <div 
        className={`fixed inset-0 z-50 bg-background/98 backdrop-blur-2xl transition-all duration-500 ease-in-out md:hidden flex flex-col ${
          isMenuOpen 
            ? "opacity-100 pointer-events-auto translate-y-0" 
            : "opacity-0 pointer-events-none -translate-y-full"
        }`}
      >
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-6 pt-24 pb-8 flex-1 flex flex-col h-full overflow-y-auto">
          <div className="flex justify-center mb-12 transform transition-all duration-700 delay-100 translate-y-0 opacity-100">
            <span className="text-2xl font-bold tracking-tight text-foreground">API اشعار فارسی</span>
          </div>

          {/* جستجو در منوي موبايل */}
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false)
              setTimeout(() => window.dispatchEvent(new CustomEvent("command-bar:open")), 100)
            }}
            className="group flex items-center justify-between p-4 rounded-2xl text-lg font-bold text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all duration-300 mb-2 border border-border"
          >
            <span className="flex items-center gap-3">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              جستجوي سراسري
            </span>
            <kbd className="text-[10px] font-mono bg-muted border border-border rounded px-1.5 py-0.5">Ctrl K</kbd>
          </button>

          <nav className="flex flex-col gap-2 w-full max-w-sm mx-auto flex-1 justify-center">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                className={`group flex items-center justify-between p-4 rounded-2xl text-2xl font-bold text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all duration-300`}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  transitionDelay: `${(index + 1) * 75}ms`,
                  transform: isMenuOpen ? "translateX(0)" : "translateX(20px)",
                  opacity: isMenuOpen ? 1 : 0,
                }}
              >
                {link.name}
                <ChevronLeft className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </Link>
            ))}
            
            <Link
              href="/contribute"
              className="group flex items-center justify-between p-4 rounded-2xl text-2xl font-bold text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all duration-300"
              onClick={() => setIsMenuOpen(false)}
              style={{
                transitionDelay: `${(navLinks.length + 1) * 75}ms`,
                transform: isMenuOpen ? "translateX(0)" : "translateX(20px)",
                opacity: isMenuOpen ? 1 : 0,
              }}
            >
              <div className="flex items-center gap-3">
                <PenTool className="w-6 h-6 group-hover:scale-110 transition-transform" />
                مشارکت
              </div>
              <ChevronLeft className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>
          </nav>

          <div 
            className="mt-auto pt-8 w-full max-w-sm mx-auto"
            style={{
              transitionDelay: `${(navLinks.length + 2) * 75}ms`,
              transform: isMenuOpen ? "translateY(0)" : "translateY(20px)",
              opacity: isMenuOpen ? 1 : 0,
              transition: "all 0.5s ease"
            }}
          >
            {mounted && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-2xl mb-4 border border-border/50">
                <span className="font-semibold text-foreground/80 text-sm">پوسته</span>
                <div className="flex gap-1 bg-background/50 p-1 rounded-xl border border-border/30">
                  <Button
                    variant={theme === "light" ? "secondary" : "ghost"}
                    size="xs"
                    className="rounded-lg px-3 py-1 text-xs"
                    onClick={() => setTheme("light")}
                  >
                    روشن
                  </Button>
                  <Button
                    variant={theme === "dark" ? "secondary" : "ghost"}
                    size="xs"
                    className="rounded-lg px-3 py-1 text-xs"
                    onClick={() => setTheme("dark")}
                  >
                    تاریک
                  </Button>
                  <Button
                    variant={theme === "system" ? "secondary" : "ghost"}
                    size="xs"
                    className="rounded-lg px-3 py-1 text-xs"
                    onClick={() => setTheme("system")}
                  >
                    سیستم
                  </Button>
                </div>
              </div>
            )}

            <a href="https://github.com/arsamadineh/Persian-Quote-API" target="_blank" rel="noopener noreferrer" className="block w-full" onClick={() => setIsMenuOpen(false)}>
              <Button size="lg" className="w-full rounded-2xl text-lg h-14 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25 border-0">
                <Github className="w-5 h-5 ml-2" />
                مشاهده در گیت‌هاب
              </Button>
            </a>
            
            <p className="text-center text-sm text-muted-foreground mt-6 font-medium">
              API اشعار فارسی — {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
