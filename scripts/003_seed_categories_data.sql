-- Insert quote categories
INSERT INTO public.categories (name_persian, name_english, description_persian, description_english) VALUES
('عشق', 'Love', 'اشعار درباره عشق و محبت', 'Poems about love and affection'),
('عرفان', 'Mysticism', 'اشعار عارفانه و معنوی', 'Mystical and spiritual poems'),
('حکمت', 'Wisdom', 'اشعار حکیمانه و آموزنده', 'Wise and educational poems'),
('طبیعت', 'Nature', 'اشعار درباره طبیعت و زیبایی', 'Poems about nature and beauty'),
('زندگی', 'Life', 'اشعار درباره زندگی و تجربه', 'Poems about life and experience'),
('دوستی', 'Friendship', 'اشعار درباره دوستی و رفاقت', 'Poems about friendship and companionship'),
('غم و شادی', 'Joy and Sorrow', 'اشعار درباره احساسات انسانی', 'Poems about human emotions'),
('زمان', 'Time', 'اشعار درباره گذر زمان', 'Poems about the passage of time')
ON CONFLICT (name_persian) DO NOTHING;
