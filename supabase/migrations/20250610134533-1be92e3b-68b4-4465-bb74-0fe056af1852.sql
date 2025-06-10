
-- Create autonomous_wrestling_events table
CREATE TABLE public.autonomous_wrestling_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  promotion TEXT NOT NULL CHECK (promotion IN ('WWE', 'AEW', 'NXT', 'TNA', 'NJPW', 'ROH')),
  date DATE NOT NULL,
  time_et TIME NOT NULL,
  time_pt TIME NOT NULL,
  time_cet TIME NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  network TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('weekly', 'ppv', 'special')),
  match_card TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index for faster date queries
CREATE INDEX idx_autonomous_wrestling_events_date ON public.autonomous_wrestling_events(date);

-- Create an index for faster promotion queries
CREATE INDEX idx_autonomous_wrestling_events_promotion ON public.autonomous_wrestling_events(promotion);
