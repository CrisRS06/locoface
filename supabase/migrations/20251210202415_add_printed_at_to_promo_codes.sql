-- Add printed_at column to track when promo codes were printed
ALTER TABLE promo_codes ADD COLUMN printed_at TIMESTAMPTZ;

-- Create index for efficient queries on unprinted codes
CREATE INDEX idx_promo_codes_printed_at ON promo_codes (printed_at) WHERE printed_at IS NULL;
