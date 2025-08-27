-- Create the main quotes table for Persian quotes
CREATE TABLE IF NOT EXISTS public.persian_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_persian TEXT NOT NULL,
  text_english TEXT,
  poet VARCHAR(100) NOT NULL,
  poet_english VARCHAR(100),
  source VARCHAR(200),
  category VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_persian_quotes_poet ON public.persian_quotes(poet);
CREATE INDEX IF NOT EXISTS idx_persian_quotes_category ON public.persian_quotes(category);
CREATE INDEX IF NOT EXISTS idx_persian_quotes_tags ON public.persian_quotes USING GIN(tags);

-- Create a table for famous Persian poets
CREATE TABLE IF NOT EXISTS public.poets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_persian VARCHAR(100) NOT NULL UNIQUE,
  name_english VARCHAR(100) NOT NULL UNIQUE,
  birth_year INTEGER,
  death_year INTEGER,
  biography_persian TEXT,
  biography_english TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for quote categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_persian VARCHAR(50) NOT NULL UNIQUE,
  name_english VARCHAR(50) NOT NULL UNIQUE,
  description_persian TEXT,
  description_english TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for API usage statistics (public access, no RLS needed)
CREATE TABLE IF NOT EXISTS public.api_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(100) NOT NULL,
  method VARCHAR(10) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  response_time_ms INTEGER,
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for API stats
CREATE INDEX IF NOT EXISTS idx_api_stats_endpoint ON public.api_stats(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_stats_created_at ON public.api_stats(created_at);

-- Add foreign key constraints
ALTER TABLE public.persian_quotes 
ADD CONSTRAINT fk_persian_quotes_poet 
FOREIGN KEY (poet) REFERENCES public.poets(name_persian) ON UPDATE CASCADE;

-- Enable RLS on tables that might need user-specific access in the future
-- For now, quotes are public but we enable RLS for future admin features
ALTER TABLE public.persian_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no authentication required)
CREATE POLICY "Allow public read access to quotes" ON public.persian_quotes
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to poets" ON public.poets
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" ON public.categories
  FOR SELECT USING (true);

-- API stats table doesn't need RLS as it's for internal tracking
