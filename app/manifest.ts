import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "API اشعار فارسی — Persian Quotes API",
    short_name: "اشعار فارسی",
    description:
      "دسترسی آزاد به گنجینه اشعار شاعران بزرگ فارسی و سخنان بزرگان، از طریق API عمومی RESTful همراه با موتور تیغ.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    lang: "fa-IR",
    dir: "rtl",
    background_color: "#0c0a09",
    theme_color: "#f59e0b",
    categories: ["books", "education", "lifestyle", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/og-image.svg",
        sizes: "1200x630",
        type: "image/svg+xml",
        form_factor: "wide",
        label: "صفحه اصلی API اشعار فارسی",
      },
    ],
    shortcuts: [
      {
        name: "مستندات",
        short_name: "Docs",
        url: "/docs",
        description: "مرجع کامل اندپوینت‌ها و موتور تیغ",
      },
      {
        name: "موتور تیغ",
        short_name: "Engine",
        url: "/sakhtar",
        description: "معماری و متریک زنده موتور",
      },
      {
        name: "نمونه‌ها",
        short_name: "Examples",
        url: "/examples",
        description: "نمونه کد در چند زبان",
      },
      {
        name: "سازنده ویجت",
        short_name: "Widget",
        url: "/embed",
        description: "ساخت ویجت قابل تعبیه",
      },
    ],
    prefer_related_applications: false,
  }
}
