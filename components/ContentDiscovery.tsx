"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SearchField, Label, Input, Button, Group } from 'react-aria-components';
import { Search, X } from 'lucide-react';

const EMOTIONS = [
  { id: 'joy', label: 'Joy (شادی)' },
  { id: 'solitude', label: 'Solitude (تنهایی)' },
  { id: 'melancholy', label: 'Melancholy (اندوه)' },
  { id: 'mysticism', label: 'Mysticism (عرفان)' },
];

const SUGGESTIONS = [
  "Love and Devotion",
  "Nature and Beauty",
  "Wisdom and Truth",
  "Life and Death",
  "Sufism and Mysticism"
];

export function ContentDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = SUGGESTIONS.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) {
      e.preventDefault();
      setSearchTerm(filteredSuggestions[focusedSuggestionIndex]);
      setIsDropdownOpen(false);
      setFocusedSuggestionIndex(-1);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setFocusedSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 0 && filteredSuggestions.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
      setFocusedSuggestionIndex(-1);
    }
  }, [searchTerm, filteredSuggestions.length]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8 relative z-20">
      {/* Screen Reader Live Region */}
      <div aria-live="polite" className="sr-only">
        {activeVibe ? `Selected vibe: ${EMOTIONS.find(e => e.id === activeVibe)?.label}` : 'No vibe selected'}
      </div>

      <div className="relative w-full max-w-2xl mx-auto">
        <SearchField
          value={searchTerm}
          onChange={setSearchTerm}
          onSubmit={(value) => {
            setIsDropdownOpen(false);
            console.log('Search submitted:', value);
          }}
          className="flex flex-col gap-2"
        >
          <Label className="sr-only">Search contents</Label>
          <Group className="relative flex items-center bg-background border border-border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary overflow-hidden transition-all duration-300">
            <div className="px-3 text-muted-foreground flex items-center">
              <Search className="w-5 h-5" />
            </div>
            <Input
              ref={inputRef}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchTerm && filteredSuggestions.length > 0) setIsDropdownOpen(true);
              }}
              onBlur={() => {
                // Delay closing to allow clicking suggestions
                setTimeout(() => setIsDropdownOpen(false), 200);
              }}
              placeholder="Search quotes, poets, topics..."
              className="flex-1 py-3 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg w-full"
            />
            <Button className="px-3 text-muted-foreground hover:text-foreground outline-none pressed:opacity-70 flex items-center justify-center">
              {searchTerm && <X className="w-5 h-5" />}
            </Button>
          </Group>
        </SearchField>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="py-2" role="listbox">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  role="option"
                  aria-selected={index === focusedSuggestionIndex}
                  className={`px-4 py-2 cursor-pointer transition-colors duration-150 flex items-center gap-2
                    ${index === focusedSuggestionIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}
                  `}
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setIsDropdownOpen(false);
                    setFocusedSuggestionIndex(-1);
                    inputRef.current?.focus();
                  }}
                >
                  <Search className="w-4 h-4 opacity-50" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-4">
        <h3 className="text-xl font-semibold text-center mb-6 text-foreground">Emotions / Vibes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EMOTIONS.map((emotion) => {
            const isActive = activeVibe === emotion.id;
            return (
              <button
                key={emotion.id}
                onClick={() => setActiveVibe(isActive ? null : emotion.id)}
                className={`
                  relative p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center
                  transition-all duration-300 ease-in-out transform
                  ${isActive
                    ? 'scale-105 shadow-[0_0_20px_rgba(249,115,22,0.4)] border-orange-500/50 backdrop-blur-md bg-white/10 dark:bg-black/20 text-orange-600 dark:text-orange-400 z-10'
                    : 'scale-100 shadow-sm border border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground hover:-translate-y-1'
                  }
                `}
                style={{
                  willChange: 'transform, box-shadow, background-color',
                }}
              >
                {/* Active glow effect element */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                )}
                <span className="font-medium text-lg relative z-10">
                  {emotion.label.split(' ')[0]}
                </span>
                <span className="text-sm opacity-70 relative z-10">
                  {emotion.label.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
