import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const STARTER_PACK_PRICE_CENTS = 999; // $9.99

export async function POST() {
  try {
    // 1. Create pending credit_pack record
    const { data: pack, error: packError } = await supabaseAdmin
      .from('credit_packs')
      .insert([
        {
          buyer_email: '',
          pack_type: 'starter',
          total_codes: 10,
          codes_generated: 0,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (packError) {
      console.error('Supabase error:', packError);
      return NextResponse.json({ error: 'Failed to create pack' }, { status: 500 });
    }

    // 2. Create PaymentIntent in Onvo Pay
    const ONVO_API_URL = process.env.ONVO_API_URL || 'https://api.onvopay.com/v1';
    const ONVO_SECRET_KEY = process.env.ONVO_SECRET_KEY;

    if (!ONVO_SECRET_KEY) {
      console.error('ONVO_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const paymentIntentResponse = await fetch(`${ONVO_API_URL}/payment-intents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ONVO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: STARTER_PACK_PRICE_CENTS,
        currency: 'USD',
        description: 'Locoface Starter Pack (10 stickers)',
        metadata: {
          pack_id: pack.id,
          type: 'starter_pack',
        },
      }),
    });

    if (!paymentIntentResponse.ok) {
      const errorData = await paymentIntentResponse.json();
      console.error('Onvo PaymentIntent error:', errorData);
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    const paymentIntent = await paymentIntentResponse.json();

    // 3. Update pack with paymentIntentId
    const { error: updateError } = await supabaseAdmin
      .from('credit_packs')
      .update({ onvo_payment_intent_id: paymentIntent.id })
      .eq('id', pack.id);

    if (updateError) {
      console.error('Failed to update pack with paymentIntentId:', updateError);
    }

    return NextResponse.json({
      success: true,
      packId: pack.id,
      paymentIntentId: paymentIntent.id,
      type: 'starter_pack',
    });
  } catch (error) {
    console.error('Starter pack checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
