-- Promo Codes Table (for free stickers)
create table if not exists public.promo_codes (
  id uuid not null default gen_random_uuid() primary key,
  code text not null unique,
  max_uses integer not null default 1,
  current_uses integer not null default 0,
  expires_at timestamp with time zone null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

-- Add promo_code_id to orders for tracking
alter table public.orders
add column if not exists promo_code_id uuid references public.promo_codes(id);

-- RLS for promo_codes
alter table public.promo_codes enable row level security;

-- Only service role can access promo codes (for security)
create policy "Allow service role full access to promo_codes"
  on public.promo_codes for all
  using (auth.role() = 'service_role');

-- Index for fast promo code lookups
create index if not exists idx_promo_codes_code on public.promo_codes(code);

-- Create a test promo code for testing
INSERT INTO promo_codes (code, max_uses) VALUES ('FREESTICKER', 100);
