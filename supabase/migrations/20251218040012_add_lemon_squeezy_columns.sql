-- Add Lemon Squeezy columns for A/B testing payment providers
-- These columns will store Lemon Squeezy specific IDs alongside existing Onvo columns

-- Add lemon_checkout_id and lemon_order_id to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS lemon_checkout_id TEXT,
ADD COLUMN IF NOT EXISTS lemon_order_id TEXT;

-- Add lemon_checkout_id and lemon_order_id to credit_packs table
ALTER TABLE public.credit_packs
ADD COLUMN IF NOT EXISTS lemon_checkout_id TEXT,
ADD COLUMN IF NOT EXISTS lemon_order_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_lemon_order_id ON public.orders(lemon_order_id);
CREATE INDEX IF NOT EXISTS idx_credit_packs_lemon_order_id ON public.credit_packs(lemon_order_id);

-- Comment explaining the purpose
COMMENT ON COLUMN public.orders.lemon_checkout_id IS 'Lemon Squeezy checkout ID for A/B testing';
COMMENT ON COLUMN public.orders.lemon_order_id IS 'Lemon Squeezy order ID from webhook';
COMMENT ON COLUMN public.credit_packs.lemon_checkout_id IS 'Lemon Squeezy checkout ID for A/B testing';
COMMENT ON COLUMN public.credit_packs.lemon_order_id IS 'Lemon Squeezy order ID from webhook';
