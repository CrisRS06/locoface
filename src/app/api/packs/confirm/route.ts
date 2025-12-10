import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generatePromoCode, sendStarterPackCodes } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, email } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

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

    // 5. Payment succeeded - generate 10 promo codes
    const buyerEmail = email || paymentIntent.customer?.email || '';

    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(generatePromoCode());
    }

    // Insert promo codes into database
    const promoCodesData = codes.map(code => ({
      code,
      max_uses: 1,
      current_uses: 0,
      is_active: true,
      pack_id: pack.id,
      buyer_email: buyerEmail,
    }));

    const { error: codesError } = await supabaseAdmin
      .from('promo_codes')
      .insert(promoCodesData);

    if (codesError) {
      console.error('Failed to insert promo codes:', codesError);
      return NextResponse.json({ error: 'Failed to create codes' }, { status: 500 });
    }

    // Update credit_pack status
    const { error: updateError } = await supabaseAdmin
      .from('credit_packs')
      .update({
        buyer_email: buyerEmail,
        status: 'paid',
        codes_generated: 10,
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
        ? `Your 10 promo codes have been sent to ${buyerEmail}!`
        : 'Your 10 promo codes have been created! Check your email.',
      codes: buyerEmail ? undefined : codes,
    });

  } catch (error) {
    console.error('Pack confirmation error:', error);
    return NextResponse.json({ error: 'Failed to confirm pack' }, { status: 500 });
  }
}
