-- Migration: Drop unused generations table
-- Reason: Table was never used in the app (preview_images is used instead)
-- This resolves RLS security warning in Supabase Linter

-- Remove generations table from realtime publication (if it exists in publication)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'generations'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE generations;
  END IF;
END $$;

-- Drop the unused table
DROP TABLE IF EXISTS public.generations;
