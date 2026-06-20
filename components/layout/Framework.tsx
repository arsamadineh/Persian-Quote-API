'use client';

import React from 'react';
import { FocusScope } from '@react-aria/focus';
import { useLocale } from 'react-aria';

interface LayoutFrameworkProps {
  children: React.ReactNode;
  locale?: 'fa-IR' | 'en-US';
}

export function LayoutFramework({ children, locale = 'fa-IR' }: LayoutFrameworkProps) {
  const isRTL = locale === 'fa-IR';

  return (
    <div
      className={`min-h-screen w-full bg-[#0B0B0C] text-white flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <FocusScope contain restoreFocus autoFocus>
        <div
          className="grid grid-cols-1 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] min-h-screen w-full"
          role="grid"
        >
          {/* Sidebar / Navigation Area */}
          <div
            className="hidden md:block bg-[rgba(11,11,12,0.4)] backdrop-blur-xl border-r border-[rgba(255,255,255,0.1)] p-4"
            role="row"
          >
            <div role="gridcell" className="h-full flex flex-col">
              <nav aria-label="Main Navigation">
                {/* Minimalist navigation placeholder */}
                <div className="w-12 h-1 bg-[#FF6B35] mb-8 rounded-full"></div>
                <ul className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="block px-4 py-2 rounded-md hover:bg-[rgba(255,255,255,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0C] transition-all"
                      >
                        {isRTL ? `گزینه ${i}` : `Menu Item ${i}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <main
            className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto"
            role="row"
          >
            <div role="gridcell" className="max-w-[1920px] mx-auto h-full flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </FocusScope>
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div
      className={`bg-[rgba(11,11,12,0.4)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-xl shadow-lg hover:border-[#FF6B35]/50 transition-colors focus-within:ring-2 focus-within:ring-[#FF6B35] focus-within:ring-offset-2 focus-within:ring-offset-[#0B0B0C] ${className}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}
