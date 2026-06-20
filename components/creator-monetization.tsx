"use client"

import React, { useState } from "react"
import { TextField, Input, Label, Button as AriaButton } from "react-aria-components"
import { Drawer } from "vaul"
import { Info, Image as ImageIcon, Frame, RefreshCw, ShoppingCart } from "lucide-react"

export function CreatorMonetization() {
  const [activeFormat, setActiveFormat] = useState("minimal")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeNote, setActiveNote] = useState({ text: "", note: "" })

  const handleLineClick = (text: string, note: string) => {
    setActiveNote({ text, note })
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-8 w-full font-sans text-neutral-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card A: Micro-tipping terminal */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Support the Creator</h2>
            <p className="text-neutral-400 mb-6 text-sm">
              Your tips help sustain independent art and code. Choose an amount or enter your own.
            </p>

            <div className="flex gap-3 mb-6">
              {["$3", "$5", "$10"].map((amount) => (
                <button
                  key={amount}
                  className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl border border-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {amount}
                </button>
              ))}
            </div>

            <TextField className="flex flex-col gap-2 w-full mb-8">
              <Label className="text-sm font-medium text-neutral-300">Custom Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-3 pl-8 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                />
              </div>
            </TextField>
          </div>

          <AriaButton className="w-full min-h-[48px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-neutral-900">
            Send Tip
          </AriaButton>
        </div>

        {/* Card B: Annotation layout */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Poetry Notes</h2>
            <Info className="text-neutral-500 w-5 h-5" />
          </div>
          <p className="text-neutral-400 mb-4 text-sm">Click highlighted lines to reveal hidden annotations.</p>

          <div className="flex-1 bg-neutral-950 rounded-xl p-6 border border-neutral-800 text-center flex flex-col justify-center space-y-6" dir="rtl">
            <button
              onClick={() => handleLineClick("بشنو از نی چون حکایت می‌کند", "نی نماد انسان کامل است که از نیستان عالم روحانی جدا شده و شکایت از فراق دارد.")}
              className="text-lg text-neutral-300 hover:text-orange-400 hover:bg-orange-500/10 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-orange-500/30 cursor-pointer text-center block w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              بشنو از نی چون حکایت می‌کند
            </button>
            <button
              onClick={() => handleLineClick("از جدایی‌ها شکایت می‌کند", "شکایت نی، داستان دوری جان آدمی از اصل الهی خود است.")}
              className="text-lg text-neutral-300 hover:text-orange-400 hover:bg-orange-500/10 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-orange-500/30 cursor-pointer text-center block w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              از جدایی‌ها شکایت می‌کند
            </button>
            <button
              onClick={() => handleLineClick("کز نیستان تا مرا ببریده‌اند", "نیستان جایگاه اصلی و منشأ ارواح پیش از ورود به کالبد مادی است.")}
              className="text-lg text-neutral-300 hover:text-orange-400 hover:bg-orange-500/10 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-orange-500/30 cursor-pointer text-center block w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              کز نیستان تا مرا ببریده‌اند
            </button>
            <button
              onClick={() => handleLineClick("در نفیرم مرد و زن نالیده‌اند", "ناله نی، بازتاب درد مشترک تمام انسان‌ها (مرد و زن) در غم هجران است.")}
              className="text-lg text-neutral-300 hover:text-orange-400 hover:bg-orange-500/10 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-orange-500/30 cursor-pointer text-center block w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              در نفیرم مرد و زن نالیده‌اند
            </button>
          </div>

          <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
              <Drawer.Content className="bg-neutral-900 flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] border-t border-neutral-800">
                <div className="p-4 bg-neutral-900 rounded-t-[20px] flex-1">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-neutral-700 mb-8" />
                  <div className="max-w-md mx-auto text-center" dir="rtl">
                    <Drawer.Title className="font-bold text-xl text-white mb-4 leading-loose bg-neutral-800/50 p-4 rounded-xl inline-block border border-neutral-700/50">
                      {activeNote.text}
                    </Drawer.Title>
                    <p className="text-neutral-300 text-lg leading-relaxed mt-4">
                      {activeNote.note}
                    </p>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>

      {/* Mock Physical Merchandise Generation Control Block */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Merch Studio</h2>
              <p className="text-neutral-400 text-sm">Design physical goods from your favorite poems.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Format</h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setActiveFormat("minimal")}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all min-h-[48px] ${
                    activeFormat === "minimal"
                      ? "bg-orange-500/10 border-orange-500 text-orange-400"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="font-medium">Minimal Print</span>
                </button>
                <button
                  onClick={() => setActiveFormat("framed")}
                  className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all min-h-[48px] ${
                    activeFormat === "framed"
                      ? "bg-orange-500/10 border-orange-500 text-orange-400"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <Frame className="w-5 h-5" />
                  <span className="font-medium">Framed Canvas</span>
                </button>
              </div>
            </div>

            <button className="w-full min-h-[48px] bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 mt-auto transition-colors hover:bg-neutral-200">
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart - $35</span>
            </button>
          </div>

          <div className="w-full md:w-2/3 bg-neutral-950 rounded-xl border border-neutral-800 p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
            {/* Mock Preview Area */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="p-2 bg-neutral-900 rounded-lg text-neutral-400 hover:text-white border border-neutral-800 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className={`transition-all duration-500 ${activeFormat === "framed" ? "p-4 bg-neutral-800 border-4 border-neutral-700 shadow-2xl" : "p-0 shadow-lg"}`}>
              <div className="bg-[#f4f1ea] text-[#2c2a25] w-64 h-80 flex flex-col items-center justify-center p-8 shadow-inner relative">
                <div className="absolute top-4 left-4 text-xs opacity-50">#12</div>
                <div className="text-center font-serif leading-loose" dir="rtl">
                  <p className="text-xl mb-4 border-b border-[#2c2a25]/20 pb-4">بشنو از نی چون حکایت می‌کند</p>
                  <p className="text-sm opacity-70 mt-4">مولانا</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
