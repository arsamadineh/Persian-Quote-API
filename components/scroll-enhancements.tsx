"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollEnhancements() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showToTop, setShowToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100)
      }
      setShowToTop(totalScroll > 280)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {/* Top Gold Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-600 to-amber-400 z-[9999] transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Floating Back To Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="بازگشت به ابتدای صفحه"
        className={`fixed bottom-6 left-6 z-40 p-2.5 rounded-full border border-border bg-card/90 backdrop-blur-md text-muted-foreground hover:text-foreground hover:border-primary/50 shadow-lg transition-all duration-300 ${
          showToTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-4 h-4 text-primary" />
      </button>
    </>
  )
}
