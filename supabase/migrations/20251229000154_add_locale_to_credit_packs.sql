-- Add locale column to credit_packs for bilingual email support
ALTER TABLE public.credit_packs
ADD COLUMN IF NOT EXISTS locale text DEFAULT 'es';

-- Add comment for documentation
COMMENT ON COLUMN public.credit_packs.locale IS 'User locale for email language (en/es)';
