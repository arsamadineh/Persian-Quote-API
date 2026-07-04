/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ── بهینه‌سازی‌های سئو و امنیت ─────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // کمک به موتورهای جستجو برای تشخیص زبان اصلی محتوا
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      {
        // فایل‌های متنی برای خزنده‌ها (llms.txt و غیره)
        source: "/llms.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        source: "/llms-full.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        // تصاویر SVG: اجازه caching طولانی
        source: "/((?!api).*)",
        headers: [
          { key: "X-Robots-Tag", value: "all, max-image-preview:large" },
        ],
      },
    ]
  },
  redirects: async () => [
    {
      // هدایت /robots.txt داخلی به robots تولیدشده توسط Next
      source: "/robots.txt",
      destination: "/robots",
      permanent: false,
    },
  ],
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
