
-- First, let's fix the RLS policy issues on wrestler_mentions_log table
-- The table currently has RLS enabled but no policies, causing all inserts to fail

-- Drop existing RLS if any and recreate with proper policies
DROP POLICY IF EXISTS "Enable insert for service role" ON public.wrestler_mentions_log;
DROP POLICY IF EXISTS "Enable read for all users" ON public.wrestler_mentions_log;

-- Create policies to allow the system to insert and read wrestler mention data
CREATE POLICY "Enable insert for service role" ON public.wrestler_mentions_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.wrestler_mentions_log
  FOR SELECT
  USING (true);

-- Also ensure the wrestler_metrics_history table has proper policies
DROP POLICY IF EXISTS "Enable insert for service role" ON public.wrestler_metrics_history;
DROP POLICY IF EXISTS "Enable read for all users" ON public.wrestler_metrics_history;

CREATE POLICY "Enable insert for service role" ON public.wrestler_metrics_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON public.wrestler_metrics_history
  FOR SELECT
  USING (true);

-- Add an index on wrestler_mentions_log for better performance
CREATE INDEX IF NOT EXISTS idx_wrestler_mentions_wrestler_id ON public.wrestler_mentions_log(wrestler_id);
CREATE INDEX IF NOT EXISTS idx_wrestler_mentions_created_at ON public.wrestler_mentions_log(created_at);

-- Add an index on wrestler_metrics_history for better performance
CREATE INDEX IF NOT EXISTS idx_wrestler_metrics_wrestler_id ON public.wrestler_metrics_history(wrestler_id);
CREATE INDEX IF NOT EXISTS idx_wrestler_metrics_date ON public.wrestler_metrics_history(date);
