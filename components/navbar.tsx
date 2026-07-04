"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Code, Menu, PenTool } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 relative">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">API اشعار فارسی</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Persian Quotes API</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              خانه
            </Link>
            <Link href="/docs" className="text-foreground hover:text-primary transition-colors font-medium">
              مستندات
            </Link>
            <Link href="/examples" className="text-foreground hover:text-primary transition-colors font-medium">
              نمونه‌ها
            </Link>
            <Link href="/embed" className="text-foreground hover:text-primary transition-colors font-medium">
              ویجت
            </Link>
            <Link href="/contribute" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-1">
              <PenTool className="w-4 h-4" />
              مشارکت
            </Link>
            <a href="https://github.com/arsamadineh/Persian-Quote-API" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="persian-button bg-transparent">
                <Code className="w-4 h-4 ml-2" />
                GitHub
              </Button>
            </a>
          </nav>
          <div className="md:hidden">
            <Button variant="outline" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-card/95 backdrop-blur-sm shadow-lg border-b border-border">
            <nav className="flex flex-col items-center gap-4 py-6">
              <Link
                href="/"
                className="text-foreground hover:text-primary transition-colors font-medium text-lg w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                خانه
              </Link>
              <Link
                href="/docs"
                className="text-foreground hover:text-primary transition-colors font-medium text-lg w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                مستندات
              </Link>
              <Link
                href="/examples"
                className="text-foreground hover:text-primary transition-colors font-medium text-lg w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                نمونه‌ها
              </Link>
              <Link
                href="/embed"
                className="text-foreground hover:text-primary transition-colors font-medium text-lg w-full text-center py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                ویجت
              </Link>
              <Link
                href="/contribute"
                className="text-foreground hover:text-primary transition-colors font-medium text-lg w-full text-center py-2 flex items-center justify-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <PenTool className="w-5 h-5" />
                مشارکت
              </Link>
              <a href="https://github.com/arsamadineh/Persian-Quote-API" target="_blank" rel="noopener noreferrer" className="mt-2" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" size="sm" className="persian-button bg-transparent">
                  <Code className="w-4 h-4 ml-2" />
                  GitHub
                </Button>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
