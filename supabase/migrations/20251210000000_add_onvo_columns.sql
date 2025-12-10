-- Migration: Add Onvo Pay payment intent ID columns
-- This migration adds the onvo_payment_intent_id column to support Onvo Pay integration

-- Add onvo_payment_intent_id to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS onvo_payment_intent_id text;

-- Add onvo_payment_intent_id to credit_packs table
ALTER TABLE public.credit_packs
ADD COLUMN IF NOT EXISTS onvo_payment_intent_id text;

-- Create index for fast lookups by payment intent ID
CREATE INDEX IF NOT EXISTS idx_orders_onvo_payment_intent ON public.orders(onvo_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_credit_packs_onvo_payment_intent ON public.credit_packs(onvo_payment_intent_id);
