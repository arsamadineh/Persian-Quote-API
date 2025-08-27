-- Insert famous Persian poets
INSERT INTO public.poets (name_persian, name_english, birth_year, death_year, biography_persian, biography_english) VALUES
('مولانا جلال‌الدین رومی', 'Rumi', 1207, 1273, 'بزرگترین شاعر عارف فارسی‌زبان و یکی از بزرگترین شاعران جهان', 'Greatest Persian mystic poet and one of the world''s greatest poets'),
('حافظ شیرازی', 'Hafez', 1315, 1390, 'شاعر بزرگ غزل‌سرای فارسی، معروف به لسان‌الغیب', 'Great Persian lyric poet, known as the tongue of the unseen'),
('سعدی شیرازی', 'Saadi', 1210, 1291, 'شاعر بزرگ فارسی، مؤلف گلستان و بوستان', 'Great Persian poet, author of Gulistan and Bustan'),
('فردوسی', 'Ferdowsi', 940, 1020, 'شاعر حماسه‌سرای بزرگ فارسی، سراینده شاهنامه', 'Great Persian epic poet, composer of Shahnameh'),
('عمر خیام', 'Omar Khayyam', 1048, 1131, 'ریاضی‌دان، ستاره‌شناس و شاعر بزرگ فارسی', 'Mathematician, astronomer and great Persian poet'),
('نظامی گنجوی', 'Nizami', 1141, 1209, 'شاعر بزرگ حماسه و عاشقانه‌سرای فارسی', 'Great Persian epic and romantic poet'),
('ابوالقاسم فردوسی', 'Abolqasem Ferdowsi', 940, 1020, 'شاعر بزرگ حماسی فارسی', 'Great Persian epic poet'),
('جامی', 'Jami', 1414, 1492, 'آخرین شاعر بزرگ کلاسیک فارسی', 'Last great classical Persian poet')
ON CONFLICT (name_persian) DO NOTHING;
