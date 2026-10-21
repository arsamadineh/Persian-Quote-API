// نسخهٔ موتور ساختار.
//
// کلید کش بازسازی ساختار از دو بخش ساخته می‌شود: هش محتوای شعر و همین نسخه.
// نسخه از نام و شمارهٔ نسخهٔ بستهٔ poem به‌همراه هش محتوای فایل‌های منبع آن ساخته
// می‌شود تا هر تغییر رفتار موتور، به‌طور خودکار کش قبلی را بی‌اعتبار کند.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const POEM_DIR = path.join(ROOT, "packages", "poem");

function sourceFiles(): string[] {
  const srcDir = path.join(POEM_DIR, "src");
  if (!fs.existsSync(srcDir)) return [];
  return fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".json"))
    .sort();
}

export function computeStructureVersion(): string {
  const hasher = crypto.createHash("sha1");
  const pkgPath = path.join(POEM_DIR, "package.json");
  let version = "0.0.0";
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version?: string };
    version = pkg.version ?? version;
  }

  for (const file of sourceFiles()) {
    hasher.update(file);
    hasher.update("\u0000");
    hasher.update(fs.readFileSync(path.join(POEM_DIR, "src", file)));
    hasher.update("\u0000");
  }

  const digest = hasher.digest("hex").slice(0, 12);
  return `poem-${version}-${digest}`;
}

export const STRUCTURE_VERSION = computeStructureVersion();

/** هش محتوای متنی؛ همان چیزی که در artifact و کلید کش استفاده می‌شود. */
export function contentHash(text: string): string {
  return crypto.createHash("sha1").update(text, "utf-8").digest("hex");
}
