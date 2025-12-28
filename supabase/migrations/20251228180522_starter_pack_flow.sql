-- Migration: Starter Pack Flow Optimization
-- Allow credit_packs to be created without email (email comes from Lemon Squeezy webhook)
-- Add preview_id to track which sticker to unlock
-- Add hd_base64 to store the unlocked sticker for the success page

-- Make buyer_email nullable (email will come from Lemon Squeezy webhook after payment)
ALTER TABLE public.credit_packs
  ALTER COLUMN buyer_email DROP NOT NULL;

-- Add preview_id to know which sticker to auto-unlock
ALTER TABLE public.credit_packs
  ADD COLUMN IF NOT EXISTS preview_id uuid REFERENCES public.preview_images(id);

-- Add hd_base64 to store the unlocked sticker
ALTER TABLE public.credit_packs
  ADD COLUMN IF NOT EXISTS hd_base64 text;

-- Index for faster lookups by preview_id
CREATE INDEX IF NOT EXISTS idx_credit_packs_preview_id ON public.credit_packs(preview_id);
