# پیکرهٔ شعر کلاسیک فارسی ( cleaned )

## ساختار
```
data/poetry/
  molavi/poems.json
  saadi/poems.json
  ferdowsi/poems.json
```

هر فایل:
```json
{
  "poet": { "id": "...", "name_fa": "...", "name_en": "...", "slug": "..." },
  "source": "https://github.com/amnghd/Persian_poems_corpus",
  "cleaned_at": "YYYY-MM-DD",
  "poems": [
    {
      "id": "molavi.1",
      "poet_id": "molavi",
      "title": "اثر 1",
      "category": "نامشخص",
      "meter": null,
      "url": null,
      "verses": [ { "order": 1, "text": "...", "hemistich1": "...", "hemistich2": null } ],
      "beyts": [ ["مصرع اول", "مصرع دوم"] ]
    }
  ]
}
```

## تمیزسازی
- نرمال‌سازی ی/ي، ک/ك، ه/ة، نیم‌فاصله
- حذف فاصلهٔ اضافی و خطوط خالی
- حفظ ساختار مصرع/بیت

## نمونهٔ پرس‌وجو
- همهٔ بیت‌های یک شاعر: `poems[].beyts`
- جستجوی متن: `verses[].text` contains "X"
- تصادفی: انتخاب تصادفی از `poems`

## منبع
amnghd/Persian_poems_corpus (normalized). تاریخ دریافت: 2026-10-18.
EOF