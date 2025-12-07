-- Credit Packs table for Starter Pack purchases
CREATE TABLE IF NOT EXISTS public.credit_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_email text NOT NULL,
  lemonsqueezy_order_id text,
  pack_type text NOT NULL DEFAULT 'starter',
  total_codes integer NOT NULL DEFAULT 10,
  codes_generated integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns to promo_codes for pack tracking
ALTER TABLE public.promo_codes
ADD COLUMN IF NOT EXISTS pack_id uuid REFERENCES public.credit_packs(id),
ADD COLUMN IF NOT EXISTS buyer_email text;

-- RLS for credit_packs
ALTER TABLE public.credit_packs ENABLE ROW LEVEL SECURITY;

-- Only service role can access credit_packs
CREATE POLICY "Allow service role full access to credit_packs"
  ON public.credit_packs FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_credit_packs_email ON public.credit_packs(buyer_email);
CREATE INDEX IF NOT EXISTS idx_credit_packs_order ON public.credit_packs(lemonsqueezy_order_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_pack ON public.promo_codes(pack_id);
