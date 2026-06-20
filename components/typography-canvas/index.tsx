'use client';

import React, { useState } from 'react';
import {
  Button,
  Slider,
  SliderOutput,
  SliderTrack,
  SliderThumb,
  Label,
  RadioGroup,
  Radio,
  DialogTrigger,
  Dialog,
  Modal,
  ModalOverlay
} from 'react-aria-components';
import { Download, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

export function TypographyCanvas() {
  const [fontSize, setFontSize] = useState(100); // 100% relative base
  const [lineHeight, setLineHeight] = useState(1.9);
  const [glassIntensity, setGlassIntensity] = useState(50); // 0 to 100
  const [layout, setLayout] = useState('centered'); // 'centered', 'split', 'gradient'

  // Computed styles based on layout and sliders
  const containerClasses = [
    'relative w-full overflow-hidden min-h-[600px] transition-all duration-500 flex items-center justify-center p-4 md:p-8 rounded-2xl',
    layout === 'gradient' ? 'bg-gradient-to-br from-orange-400 via-rose-400 to-amber-500 text-white' : '',
    layout === 'centered' ? 'bg-background border border-border' : '',
    layout === 'split' ? 'bg-background border border-border flex-col md:flex-row gap-8' : 'flex-col gap-8'
  ].join(' ');

  // For glassmorphism, we'll use RGB approximations for backdrop filter or just CSS variables and opacity.
  const cardStyle = {
    backgroundColor: layout === 'gradient'
        ? `rgba(255, 255, 255, ${glassIntensity / 500})`
        : `oklch(from var(--card) l c h / ${glassIntensity / 100})`,
    backdropFilter: `blur(${glassIntensity / 5}px)`,
    borderColor: `oklch(from var(--border) l c h / ${glassIntensity / 100})`,
  };

  const focusRingClass = "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9900] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="w-full space-y-8 my-8">
      {/* Controls Section */}
      <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Typography Controls</h3>
            </div>

            {/* Font Size Slider */}
            <Slider
              value={fontSize}
              onChange={(v) => setFontSize(v as number)}
              minValue={50}
              maxValue={200}
              className="flex flex-col gap-3 group"
            >
              <div className="flex justify-between text-sm">
                <Label className="text-muted-foreground font-medium">Font Scale</Label>
                <SliderOutput className="text-muted-foreground tabular-nums font-mono">
                   {({ state }) => `${state.getThumbValue(0)}%`}
                </SliderOutput>
              </div>
              <SliderTrack className="relative w-full h-2 bg-muted rounded-full overflow-visible">
                {({ state }) => (
                  <>
                    <div className="absolute h-full bg-[#ff9900] rounded-full" style={{ width: state.getThumbPercent(0) * 100 + '%' }} />
                    <SliderThumb className={`w-5 h-5 rounded-full bg-background border-2 border-[#ff9900] shadow-md top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing ${focusRingClass}`} />
                  </>
                )}
              </SliderTrack>
            </Slider>

            {/* Line Height Slider */}
            <Slider
              value={lineHeight}
              onChange={(v) => setLineHeight(v as number)}
              minValue={1.0}
              maxValue={3.0}
              step={0.1}
              className="flex flex-col gap-3 group"
            >
              <div className="flex justify-between text-sm">
                <Label className="text-muted-foreground font-medium">Line Height</Label>
                <SliderOutput className="text-muted-foreground tabular-nums font-mono" />
              </div>
              <SliderTrack className="relative w-full h-2 bg-muted rounded-full">
                {({ state }) => (
                  <>
                    <div className="absolute h-full bg-[#ff9900] rounded-full" style={{ width: state.getThumbPercent(0) * 100 + '%' }} />
                    <SliderThumb className={`w-5 h-5 rounded-full bg-background border-2 border-[#ff9900] shadow-md top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing ${focusRingClass}`} />
                  </>
                )}
              </SliderTrack>
            </Slider>

            {/* Glass Intensity Slider */}
            <Slider
              value={glassIntensity}
              onChange={(v) => setGlassIntensity(v as number)}
              minValue={0}
              maxValue={100}
              className="flex flex-col gap-3 group"
            >
              <div className="flex justify-between text-sm">
                <Label className="text-muted-foreground font-medium">Background Intensity</Label>
                <SliderOutput className="text-muted-foreground tabular-nums font-mono">
                   {({ state }) => `${state.getThumbValue(0)}%`}
                </SliderOutput>
              </div>
              <SliderTrack className="relative w-full h-2 bg-muted rounded-full">
                {({ state }) => (
                  <>
                    <div className="absolute h-full bg-[#ff9900] rounded-full" style={{ width: state.getThumbPercent(0) * 100 + '%' }} />
                    <SliderThumb className={`w-5 h-5 rounded-full bg-background border-2 border-[#ff9900] shadow-md top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing ${focusRingClass}`} />
                  </>
                )}
              </SliderTrack>
            </Slider>
          </div>
        </div>

        <div className="w-px bg-border hidden md:block"></div>

        <div className="flex-1 space-y-6 flex flex-col">
          <div className="flex items-center gap-2 border-b pb-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Layout & Export</h3>
          </div>

          <RadioGroup value={layout} onChange={setLayout} className="flex flex-col gap-4 flex-1">
            <Label className="text-sm font-medium text-muted-foreground">Design Layout</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Radio value="centered" className={`flex flex-col items-center gap-2 cursor-pointer group ${focusRingClass} rounded-xl p-3 border-2 border-transparent data-[selected]:border-[#ff9900] data-[selected]:bg-[#ff9900]/10 hover:bg-muted transition-colors`}>
                <div className="w-12 h-8 rounded border-2 border-muted-foreground/30 flex items-center justify-center p-1">
                  <div className="w-8 h-4 bg-muted-foreground/20 rounded-sm"></div>
                </div>
                <span className="text-xs font-medium">Centered Minimal</span>
              </Radio>

              <Radio value="split" className={`flex flex-col items-center gap-2 cursor-pointer group ${focusRingClass} rounded-xl p-3 border-2 border-transparent data-[selected]:border-[#ff9900] data-[selected]:bg-[#ff9900]/10 hover:bg-muted transition-colors`}>
                <div className="w-12 h-8 rounded border-2 border-muted-foreground/30 flex items-center justify-center gap-1 p-1">
                  <div className="flex-1 h-full bg-muted-foreground/20 rounded-sm"></div>
                  <div className="flex-1 h-full bg-muted-foreground/20 rounded-sm"></div>
                </div>
                <span className="text-xs font-medium">Asymmetric Split</span>
              </Radio>

              <Radio value="gradient" className={`flex flex-col items-center gap-2 cursor-pointer group ${focusRingClass} rounded-xl p-3 border-2 border-transparent data-[selected]:border-[#ff9900] data-[selected]:bg-[#ff9900]/10 hover:bg-muted transition-colors`}>
                <div className="w-12 h-8 rounded border-2 border-muted-foreground/30 flex items-center justify-center p-1 bg-gradient-to-br from-orange-200 to-amber-200">
                  <div className="w-8 h-4 bg-white/50 rounded-sm backdrop-blur-sm"></div>
                </div>
                <span className="text-xs font-medium">Full Gradient</span>
              </Radio>
            </div>
          </RadioGroup>

          <div className="pt-4 mt-auto border-t">
             <DialogTrigger>
                <Button className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all bg-[#ff9900] text-white hover:bg-[#e68a00] shadow-sm hover:shadow h-11 px-6 w-full ${focusRingClass}`}>
                  <Download className="w-4 h-4" />
                  Export Design
                </Button>
                <ModalOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 flex items-center justify-center p-4">
                  <Modal className="w-full max-w-md border bg-background p-6 shadow-xl duration-200 data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 rounded-xl">
                    <Dialog className="outline-none">
                      {({ close }) => (
                        <>
                          <h2 className="text-xl font-bold leading-none tracking-tight mb-4 flex items-center gap-2">
                             <Download className="w-5 h-5 text-[#ff9900]" />
                             Export Ready
                          </h2>
                          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Your typography design is ready to be downloaded. In a full implementation, this would trigger html2canvas or similar to capture the canvas below.
                          </p>
                          <div className="flex justify-end gap-3">
                            <Button onPress={close} className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border ${focusRingClass}`}>
                              Cancel
                            </Button>
                            <Button onPress={close} className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors bg-[#ff9900] text-white hover:bg-[#e68a00] h-10 px-6 py-2 ${focusRingClass}`}>
                              Download Image
                            </Button>
                          </div>
                        </>
                      )}
                    </Dialog>
                  </Modal>
                </ModalOverlay>
             </DialogTrigger>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className={containerClasses}>
        {/* Dynamic Background Pattern for centered/split modes */}
        {layout !== 'gradient' && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
               style={{
                 backgroundImage: 'radial-gradient(circle at 25% 25%, currentColor 2px, transparent 2px), radial-gradient(circle at 75% 75%, currentColor 2px, transparent 2px)',
                 backgroundSize: '60px 60px'
               }}
          />
        )}

        <div
          className={`relative p-8 md:p-14 rounded-3xl shadow-xl transition-all duration-300 w-full max-w-4xl border ${layout === 'split' ? 'md:w-[48%]' : ''}`}
          style={{
            ...cardStyle,
            backgroundColor: layout === 'gradient' ? `rgba(255, 255, 255, ${glassIntensity / 200})` : undefined
          }}
        >
          {/* Persian Text Component */}
          <div className="persian-content w-full flex flex-col items-center justify-center min-h-[200px]">
            <p
              className="font-vazirmatn text-center font-medium opacity-90 tracking-wide text-balance mb-8"
              dir="rtl"
              style={{
                fontSize: `clamp(1.5rem, ${fontSize * 0.02}vw + 1rem, 4.5rem)`,
                lineHeight: lineHeight
              }}
            >
              بشنو از نی چون حکایت می‌کند<br />
              از جدایی‌ها شکایت می‌کند
            </p>
            <div className="h-px w-24 bg-current opacity-20 mb-6"></div>
            <p
              className="font-vazirmatn text-center font-semibold text-lg opacity-75"
              dir="rtl"
              style={{
                color: layout === 'gradient' ? 'rgba(255,255,255,0.9)' : 'var(--primary)'
              }}
            >
              — مولانا
            </p>
          </div>
        </div>

        {/* English Translation */}
        <div
          className={`relative p-8 md:p-14 rounded-3xl transition-all duration-300 w-full max-w-4xl ${layout === 'split' ? 'md:w-[48%] border' : 'mt-4 border-none'}`}
          style={layout === 'split' ? cardStyle : {}}
        >
          <div className="english-content w-full flex flex-col items-center justify-center min-h-[200px]">
            <p
              className="font-serif italic text-center opacity-80 text-balance mb-8"
              dir="ltr"
              style={{
                fontSize: `clamp(1.1rem, ${fontSize * 0.012}vw + 0.8rem, 2.5rem)`,
                lineHeight: lineHeight * 0.9 // English usually needs slightly less line-height
              }}
            >
              "Listen to the reed how it tells a tale, complaining of separations..."
            </p>
            <div className="h-px w-24 bg-current opacity-20 mb-6"></div>
            <p
              className="font-sans text-center font-medium opacity-60 text-sm tracking-[0.2em] uppercase"
              dir="ltr"
            >
              — Rumi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
