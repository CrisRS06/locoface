import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateAndInsertPromoCode, sendStarterPackCodes } from '@/lib/email';
import { z } from 'zod';

// Zod schema for input validation
const PackConfirmSchema = z.object({
  paymentIntentId: z.string()
    .min(1, 'Payment Intent ID is required')
    .max(200, 'Invalid Payment Intent ID'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .optional()
    .nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input with Zod
    const validationResult = PackConfirmSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { paymentIntentId, email } = validationResult.data;

    // 1. Find the pack
    const { data: pack, error: packError } = await supabaseAdmin
      .from('credit_packs')
      .select('id, status, onvo_payment_intent_id, buyer_email')
      .eq('onvo_payment_intent_id', paymentIntentId)
      .single();

    if (packError || !pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    // 2. If already paid, return success
    if (pack.status === 'paid') {
      return NextResponse.json({
        success: true,
        status: 'paid',
        message: 'Your 10 promo codes have been sent to your email!',
      });
    }

    // 3. Verify payment status with Onvo API
    const ONVO_API_URL = process.env.ONVO_API_URL || 'https://api.onvopay.com/v1';
    const ONVO_SECRET_KEY = process.env.ONVO_SECRET_KEY;

    if (!ONVO_SECRET_KEY) {
      console.error('ONVO_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const verifyResponse = await fetch(`${ONVO_API_URL}/payment-intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ONVO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      console.error('Onvo API verification failed');
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }

    const paymentIntent = await verifyResponse.json();

    // 4. Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
        message: 'Payment not yet completed',
      }, { status: 202 });
    }

    // 5. Payment succeeded - generate 10 promo codes with retry logic
    const buyerEmail = email || paymentIntent.customer?.email || '';

    // Generate codes one by one with retry logic for duplicates
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = await generateAndInsertPromoCode(supabaseAdmin, pack.id, buyerEmail);
      if (code) {
        codes.push(code);
      }
    }

    if (codes.length === 0) {
      console.error('Failed to generate any promo codes for pack:', pack.id);
      return NextResponse.json({ error: 'Failed to create codes' }, { status: 500 });
    }

    if (codes.length < 10) {
      console.warn(`Only generated ${codes.length}/10 codes for pack ${pack.id}`);
    }

    // Update credit_pack status
    const { error: updateError } = await supabaseAdmin
      .from('credit_packs')
      .update({
        buyer_email: buyerEmail,
        status: 'paid',
        codes_generated: codes.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pack.id);

    if (updateError) {
      console.error('Failed to update pack:', updateError);
      return NextResponse.json({ error: 'Failed to update pack' }, { status: 500 });
    }

    // Send email with codes
    if (buyerEmail) {
      try {
        await sendStarterPackCodes({ to: buyerEmail, codes });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail - codes are in DB
      }
    }

    return NextResponse.json({
      success: true,
      status: 'paid',
      message: buyerEmail
        ? `Your ${codes.length} promo codes have been sent to ${buyerEmail}!`
        : `Your ${codes.length} promo codes have been created! Check your email.`,
      codes: buyerEmail ? undefined : codes,
    });

  } catch (error) {
    console.error('Pack confirmation error:', error);
    return NextResponse.json({ error: 'Failed to confirm pack' }, { status: 500 });
  }
}
