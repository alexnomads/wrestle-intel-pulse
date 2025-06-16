
-- Create table for storing historical wrestler metrics
CREATE TABLE public.wrestler_metrics_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  push_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  burial_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  momentum_score INTEGER NOT NULL DEFAULT 0,
  popularity_score INTEGER NOT NULL DEFAULT 0,
  confidence_level TEXT NOT NULL DEFAULT 'low' CHECK (confidence_level IN ('high', 'medium', 'low')),
  mention_count INTEGER NOT NULL DEFAULT 0,
  data_sources JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wrestler_id, date)
);

-- Create table for logging individual wrestler mentions
CREATE TABLE public.wrestler_mentions_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wrestler_id UUID NOT NULL,
  wrestler_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('news', 'reddit', 'twitter', 'youtube')),
  source_name TEXT NOT NULL,
  source_credibility_tier INTEGER NOT NULL DEFAULT 3 CHECK (source_credibility_tier IN (1, 2, 3)),
  title TEXT NOT NULL,
  content_snippet TEXT,
  sentiment_score NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  mention_context TEXT,
  keywords JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for source credibility ratings
CREATE TABLE public.source_credibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  credibility_tier INTEGER NOT NULL CHECK (credibility_tier IN (1, 2, 3)),
  weight_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  source_type TEXT NOT NULL CHECK (source_type IN ('news', 'reddit', 'twitter', 'youtube')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial source credibility data
INSERT INTO public.source_credibility (source_name, credibility_tier, weight_multiplier, source_type, description) VALUES
-- Tier 1 Sources (High Credibility)
('PWTorch', 1, 2.0, 'news', 'Pro Wrestling Torch - Dave Meltzer and team'),
('Fightful', 1, 2.0, 'news', 'Fightful Wrestling News'),
('Wrestling Observer', 1, 2.0, 'news', 'Dave Meltzer Wrestling Observer'),
('F4W Online', 1, 1.8, 'news', 'Figure Four Weekly Online'),

-- Tier 2 Sources (Medium Credibility)
('Wrestling Inc', 2, 1.5, 'news', 'Wrestling Inc News'),
('PWInsider', 2, 1.5, 'news', 'Pro Wrestling Insider'),
('Sescoops', 2, 1.3, 'news', 'Sescoops Wrestling News'),
('Wrestling Headlines', 2, 1.3, 'news', 'Wrestling Headlines'),
('Ringside News', 2, 1.2, 'news', 'Ringside News'),
('WrestleZone', 2, 1.2, 'news', 'WrestleZone'),

-- Tier 3 Sources (Lower Credibility)
('Wrestling News', 3, 1.0, 'news', 'General Wrestling News'),
('Sportskeeda Wrestling', 3, 1.0, 'news', 'Sportskeeda Wrestling Section'),
('Give Me Sport Wrestling', 3, 1.0, 'news', 'Give Me Sport Wrestling'),
('r/SquaredCircle', 3, 0.8, 'reddit', 'Reddit SquaredCircle Community'),
('r/WWE', 3, 0.7, 'reddit', 'Reddit WWE Community'),
('r/AEWOfficial', 3, 0.7, 'reddit', 'Reddit AEW Community');

-- Enable RLS on new tables
ALTER TABLE public.wrestler_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wrestler_mentions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_credibility ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read access for this analytics data)
CREATE POLICY "Public read access on wrestler_metrics_history" 
  ON public.wrestler_metrics_history FOR SELECT 
  USING (true);

CREATE POLICY "Public read access on wrestler_mentions_log" 
  ON public.wrestler_mentions_log FOR SELECT 
  USING (true);

CREATE POLICY "Public read access on source_credibility" 
  ON public.source_credibility FOR SELECT 
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_wrestler_metrics_history_wrestler_date ON public.wrestler_metrics_history(wrestler_id, date DESC);
CREATE INDEX idx_wrestler_mentions_log_wrestler_created ON public.wrestler_mentions_log(wrestler_id, created_at DESC);
CREATE INDEX idx_wrestler_mentions_log_source_credibility ON public.wrestler_mentions_log(source_credibility_tier, created_at DESC);
CREATE INDEX idx_source_credibility_name ON public.source_credibility(source_name);

-- Create function to calculate confidence level based on mention count and source quality
CREATE OR REPLACE FUNCTION public.calculate_confidence_level(
  mention_count INTEGER,
  tier1_count INTEGER DEFAULT 0,
  tier2_count INTEGER DEFAULT 0,
  tier3_count INTEGER DEFAULT 0,
  hours_since_last_mention INTEGER DEFAULT 24
) RETURNS TEXT AS $$
BEGIN
  -- High confidence: 5+ mentions with at least 2 from tier 1/2 sources in last 48 hours
  IF mention_count >= 5 AND (tier1_count + tier2_count) >= 2 AND hours_since_last_mention <= 48 THEN
    RETURN 'high';
  -- Medium confidence: 3+ mentions with at least 1 from tier 1/2 sources in last 7 days
  ELSIF mention_count >= 3 AND (tier1_count + tier2_count) >= 1 AND hours_since_last_mention <= 168 THEN
    RETURN 'medium';
  -- Low confidence: everything else
  ELSE
    RETURN 'low';
  END IF;
END;
$$ LANGUAGE plpgsql;
