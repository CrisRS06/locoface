import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';
import { z } from 'zod';

// Zod schema for input validation
const PromoValidateSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(50, 'Code too long')
    .transform(val => val.trim().toUpperCase()),
  previewId: z.string()
    .uuid('Invalid preview ID format'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validationResult = PromoValidateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { code: normalizedCode, previewId } = validationResult.data;

    // 1. Check if promo code exists and is valid
    const { data: promoCode, error: promoError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single();

    if (promoError || !promoCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid promo code' },
        { status: 200 }
      );
    }

    // 2. Check if expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Promo code has expired' },
        { status: 200 }
      );
    }

    // 3. Check usage limit
    if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'Promo code usage limit reached' },
        { status: 200 }
      );
    }

    // 4. Get the preview image (HD version)
    const { data: preview, error: previewError } = await supabaseAdmin
      .from('preview_images')
      .select('preview_base64')
      .eq('id', previewId)
      .single();

    if (previewError || !preview) {
      return NextResponse.json(
        { valid: false, error: 'Preview not found' },
        { status: 200 }
      );
    }

    // 5. Increment promo code usage
    await supabaseAdmin
      .from('promo_codes')
      .update({ current_uses: promoCode.current_uses + 1 })
      .eq('id', promoCode.id);

    // 6. Create order with promo code
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          preview_id: previewId,
          status: 'paid',
          amount_cents: 0, // Free with promo code
          promo_code_id: promoCode.id,
          hd_base64: preview.preview_base64,
          download_token: downloadToken,
          download_expires_at: expiresAt,
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { valid: false, error: 'Failed to process promo code' },
        { status: 200 }
      );
    }

    // 7. Return success with HD image
    return NextResponse.json({
      valid: true,
      hdUrl: preview.preview_base64,
      downloadToken,
      orderId: order.id,
    });

  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
