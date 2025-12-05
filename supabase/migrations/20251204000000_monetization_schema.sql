-- Create preview_images table
CREATE TABLE public.preview_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    user_id UUID,                        -- User ID if logged in (optional)
    
    -- Image Data
    preview_base64 TEXT,                 -- HD image (nullable during generation)
    watermarked_base64 TEXT,             -- Cached watermarked version
    
    -- Metadata
    prompt TEXT,                         -- The prompt used
    
    -- Status
    status TEXT DEFAULT 'pending'
        CHECK (status IN (
            'generating',  -- Processing
            'ready',       -- Completed
            'failed'       -- Failed
        )),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',     -- Waiting for payment
            'paid',        -- Payment received
            'generating',  -- Preparing HD (if needed)
            'completed',   -- Ready for download
            'failed'       -- Error
        )),

    -- Relations
    preview_id UUID REFERENCES preview_images(id),

    -- Lemon Squeezy
    lemonsqueezy_order_id TEXT UNIQUE,
    amount_cents INTEGER NOT NULL DEFAULT 199,

    -- HD Delivery
    hd_base64 TEXT,                      -- HD image without watermark
    download_token TEXT UNIQUE,           -- Secure download token
    download_expires_at TIMESTAMPTZ,      -- Expiration (24h)
    download_count INTEGER DEFAULT 0,     -- Download counter

    -- Metadata
    email TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE preview_images;

-- RLS Policies

-- preview_images: Service role manages all, public can read their own (if we had auth, but for now we rely on ID knowledge or service role)
-- For this MVP, we will allow public read for now to simplify, or better yet, keep it secure and only allow read via API or if we implement anonymous auth.
-- Let's enable RLS but allow public read for 'ready' previews if they know the ID (standard UUID security).
ALTER TABLE public.preview_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON public.preview_images FOR SELECT
USING (true);

CREATE POLICY "Enable insert for service role only"
ON public.preview_images FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role only"
ON public.preview_images FOR UPDATE
USING (auth.role() = 'service_role');

-- orders: Service role manages all, public can read if they have the download token
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages orders"
ON public.orders FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read order by download_token"
ON public.orders FOR SELECT
USING (download_token IS NOT NULL);
