import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const OUT_DIR = path.resolve(process.cwd(), "data/golden/contracts");
fs.mkdirSync(OUT_DIR, { recursive: true });

const CASES = [
  { slug: "quotes_default", path: "/api/quotes" },
  { slug: "quotes_deterministic", path: "/api/quotes?random=false&limit=5&page=1" },
  { slug: "quotes_lines_auto", path: "/api/quotes?lines=auto&limit=3&random=false" },
  { slug: "quotes_lines_separators", path: "/api/quotes?lines=separators&limit=3&random=false" },
  { slug: "quotes_lines_raw", path: "/api/quotes?lines=raw&limit=3&random=false" },
  { slug: "hafez_default", path: "/api/quotes/hafez" },
  { slug: "hafez_deterministic", path: "/api/quotes/hafez?random=false&limit=3" },
  { slug: "hafez_lines_separators", path: "/api/quotes/hafez?lines=separators&random=false&limit=3" },
  { slug: "hafez_lines_raw", path: "/api/quotes/hafez?lines=raw&random=false&limit=3" },
  { slug: "non_poetry_default", path: "/api/quotes/non-poetry" },
  { slug: "non_poetry_deterministic", path: "/api/quotes/non-poetry?random=false&limit=3" },
  { slug: "shereno_default", path: "/api/quotes/shereno" },
  { slug: "shereno_deterministic", path: "/api/quotes/shereno?random=false&limit=3" },
  { slug: "shereno_lines_auto", path: "/api/quotes/shereno?lines=auto&random=false&limit=3" },
  { slug: "shereno_lines_separators", path: "/api/quotes/shereno?lines=separators&random=false&limit=3" },
  { slug: "shereno_lines_raw", path: "/api/quotes/shereno?lines=raw&random=false&limit=3" },
  { slug: "search_eshgh", path: "/api/quotes/search?q=" + encodeURIComponent("عشق") + "&limit=5" },
  { slug: "search_hafez", path: "/api/quotes/search?q=" + encodeURIComponent("حافظ") + "&limit=5" },
  { slug: "search_empty_match", path: "/api/quotes/search?q=nonexistentqueryxyz123" },
  { slug: "category_arefaneh", path: "/api/quotes/category/" + encodeURIComponent("عارفانه") + "?limit=3" },
  { slug: "poet_hafez", path: "/api/quotes/" + encodeURIComponent("حافظ") + "?limit=3" },
  { slug: "poet_molana", path: "/api/quotes/" + encodeURIComponent("مولانا") + "?limit=3" },
  { slug: "poet_sohrab", path: "/api/quotes/" + encodeURIComponent("سهراب سپهری") + "?limit=3" },
  { slug: "poet_nima", path: "/api/quotes/" + encodeURIComponent("نیما یوشیج") + "?limit=3" },
  { slug: "poets_catalog", path: "/api/poets" },
  { slug: "categories_catalog", path: "/api/categories" },
  { slug: "stats", path: "/api/stats" },
  { slug: "health", path: "/api/health" },
  { slug: "embed_default", path: "/api/embed?theme=default" },
  { slug: "embed_dark_hafez", path: "/api/embed?theme=dark&poet=" + encodeURIComponent("حافظ") },
];

async function record() {
  const manifest: Array<{ slug: string; path: string; status: number; file: string }> = [];

  for (const c of CASES) {
    const url = `${BASE_URL}${c.path}`;
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "";
    let body: any;
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    const payload = {
      slug: c.slug,
      requestPath: c.path,
      statusCode: res.status,
      headers: {
        contentType,
        cacheControl: res.headers.get("cache-control"),
        accessControlAllowOrigin: res.headers.get("access-control-allow-origin"),
      },
      body,
      recordedAt: new Date().toISOString(),
    };

    const targetFile = path.join(OUT_DIR, `${c.slug}.json`);
    fs.writeFileSync(targetFile, JSON.stringify(payload, null, 2) + "\n", "utf8");
    manifest.push({ slug: c.slug, path: c.path, status: res.status, file: `${c.slug}.json` });
    console.log(`[CONTRACT] Recorded ${c.slug} (${res.status}) -> ${targetFile}`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`[CONTRACT] All 30 cases recorded to ${OUT_DIR}`);
}

record().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});
