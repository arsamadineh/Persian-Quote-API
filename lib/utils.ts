import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatVerse(text: string): string {
  return text
    .replace(/[\s\*]*\*+[\s\*]*/g, "\n")
    .replace(/ *\/ */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
