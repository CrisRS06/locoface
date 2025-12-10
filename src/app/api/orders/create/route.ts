import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const STICKER_PRICE_CENTS = 199; // $1.99

export async function POST(req: Request) {
  try {
    const { previewId } = await req.json();

    if (!previewId) {
      return NextResponse.json({ error: 'Preview ID is required' }, { status: 400 });
    }

    // 1. Create pending order in Supabase
    const { data: order, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          preview_id: previewId,
          status: 'pending',
          amount_cents: STICKER_PRICE_CENTS,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
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
        amount: STICKER_PRICE_CENTS,
        currency: 'USD',
        description: 'Locoface Sticker',
        metadata: {
          order_id: order.id,
          type: 'individual',
        },
      }),
    });

    if (!paymentIntentResponse.ok) {
      const errorData = await paymentIntentResponse.json();
      console.error('Onvo PaymentIntent error:', errorData);
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
    }

    const paymentIntent = await paymentIntentResponse.json();

    // 3. Update order with paymentIntentId
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ onvo_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order with paymentIntentId:', updateError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
