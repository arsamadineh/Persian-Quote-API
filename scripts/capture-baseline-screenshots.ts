import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = path.resolve(process.cwd(), "docs/evidence/phase-0/screenshots");
fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { slug: "home", path: "/" },
  { slug: "docs", path: "/docs" },
  { slug: "examples", path: "/examples" },
  { slug: "embed", path: "/embed" },
  { slug: "sakhtar", path: "/sakhtar" },
  { slug: "contribute", path: "/contribute" },
  { slug: "changelog", path: "/changelog" },
  { slug: "privacy", path: "/privacy" },
  { slug: "terms", path: "/terms" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844 },
];

const THEMES: Array<"light" | "dark"> = ["light", "dark"];

async function capture() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome-stable",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const manifest: Array<{ page: string; viewport: string; theme: string; file: string }> = [];

  for (const pageDef of PAGES) {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();
        const url = `${BASE_URL}${pageDef.path}`;

        await page.goto(url, { waitUntil: "networkidle" });
        await page.evaluate((t) => {
          if (t === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }, theme);

        await page.evaluate(() => (document as any).fonts.ready);
        await page.waitForTimeout(600);

        const filename = `${pageDef.slug}-${vp.name}-${theme}.png`;
        const filePath = path.join(OUT_DIR, filename);

        await page.screenshot({ path: filePath, fullPage: true });
        manifest.push({ page: pageDef.slug, viewport: vp.name, theme, file: filename });
        console.log(`[SCREENSHOT] Captured ${filename}`);

        await context.close();
      }
    }
  }

  await browser.close();

  // Generate markdown gallery
  let markdown = `# Phase 0 Baseline Screenshots Gallery\n\n`;
  markdown += `Captured on ${new Date().toISOString()}\n\n`;
  markdown += `Total Screenshots: ${manifest.length} across 9 pages (Desktop 1280x800 & Mobile 390x844, Light & Dark modes)\n\n`;
  for (const m of manifest) {
    markdown += `### ${m.page.toUpperCase()} (${m.viewport}, ${m.theme})\n\n`;
    markdown += `![${m.file}](${m.file})\n\n`;
  }
  fs.writeFileSync(path.join(OUT_DIR, "gallery.md"), markdown, "utf8");
  console.log(`[SCREENSHOT] Gallery generated at ${path.join(OUT_DIR, "gallery.md")}`);
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
