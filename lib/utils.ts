import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// آماده‌سازی نهایی متن برای نمایش:
// ستارهٔ تنها یا پشت‌سرهم جداکنندهٔ بند است و ممیز مورب جداکنندهٔ مصرع.
export function formatVerse(text: string): string {
  return text
    .replace(/[ \t]*\*+[ \t]*/g, "\n\n")
    .replace(/ *\/ */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim()
}
