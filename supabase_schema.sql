-- Simple Sticker Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Preview Images Table (stores generated stickers)
create table if not exists public.preview_images (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid null,
  prompt text not null,
  status text not null default 'pending',
  watermarked_base64 text null,
  preview_base64 text null,
  created_at timestamp with time zone not null default now()
);

-- 2. Orders Table (stores purchase info)
create table if not exists public.orders (
  id uuid not null default gen_random_uuid() primary key,
  preview_id uuid references public.preview_images(id),
  status text not null default 'pending',
  amount_cents integer not null default 199,
  lemonsqueezy_order_id text null,
  hd_base64 text null,
  download_token text null,
  download_expires_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.preview_images enable row level security;
alter table public.orders enable row level security;

-- 4. RLS Policies for preview_images
-- Allow anyone to read their own previews (by matching user_id or null for guests)
create policy "Allow public read access to preview_images"
  on public.preview_images for select
  using (true);

-- Only service role can insert/update (handled by supabaseAdmin)
create policy "Allow service role full access to preview_images"
  on public.preview_images for all
  using (auth.role() = 'service_role');

-- 5. RLS Policies for orders
-- Allow reading orders by download_token (for download page)
create policy "Allow public read access to orders by token"
  on public.orders for select
  using (download_token is not null);

-- Only service role can insert/update (handled by supabaseAdmin)
create policy "Allow service role full access to orders"
  on public.orders for all
  using (auth.role() = 'service_role');

-- 6. Indexes for performance
create index if not exists idx_preview_images_status on public.preview_images(status);
create index if not exists idx_orders_preview_id on public.orders(preview_id);
create index if not exists idx_orders_download_token on public.orders(download_token);

-- 7. Promo Codes Table (for free stickers)
create table if not exists public.promo_codes (
  id uuid not null default gen_random_uuid() primary key,
  code text not null unique,
  max_uses integer not null default 1,  -- Single use by default
  current_uses integer not null default 0,
  expires_at timestamp with time zone null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

-- 8. Add promo_code_id to orders for tracking
alter table public.orders
add column if not exists promo_code_id uuid references public.promo_codes(id);

-- 9. RLS for promo_codes
alter table public.promo_codes enable row level security;

-- Only service role can access promo codes (for security)
create policy "Allow service role full access to promo_codes"
  on public.promo_codes for all
  using (auth.role() = 'service_role');

-- 10. Index for fast promo code lookups
create index if not exists idx_promo_codes_code on public.promo_codes(code);

-- 11. Enable Realtime (optional, for live updates)
alter publication supabase_realtime add table preview_images;
alter publication supabase_realtime add table orders;

-- ============================================
-- EXAMPLE: Create a test promo code
-- ============================================
-- INSERT INTO promo_codes (code, max_uses) VALUES ('FREESTICKER', 1);
--
-- Generate 10 random single-use codes:
-- INSERT INTO promo_codes (code, max_uses)
-- SELECT 'LOCO' || upper(substr(md5(random()::text), 1, 6)), 1
-- FROM generate_series(1, 10);
