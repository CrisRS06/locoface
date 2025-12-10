import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, previewId } = await req.json();

    if (!paymentIntentId || !previewId) {
      return NextResponse.json(
        { error: 'Payment Intent ID and Preview ID are required' },
        { status: 400 }
      );
    }

    // 1. Find the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, preview_id, onvo_payment_intent_id')
      .eq('preview_id', previewId)
      .eq('onvo_payment_intent_id', paymentIntentId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. If already paid, return the HD image
    if (order.status === 'paid') {
      const { data: paidOrder } = await supabaseAdmin
        .from('orders')
        .select('hd_base64, download_token')
        .eq('id', order.id)
        .single();

      if (paidOrder?.hd_base64) {
        return NextResponse.json({
          success: true,
          status: 'paid',
          hdUrl: paidOrder.hd_base64,
          downloadToken: paidOrder.download_token,
        });
      }
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

    // 5. Payment succeeded - update order and generate HD image
    const { data: preview } = await supabaseAdmin
      .from('preview_images')
      .select('preview_base64')
      .eq('id', previewId)
      .single();

    if (!preview?.preview_base64) {
      return NextResponse.json({ error: 'Preview image not found' }, { status: 404 });
    }

    // Generate download token
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Update order to paid
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        hd_base64: preview.preview_base64,
        download_token: downloadToken,
        download_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: 'paid',
      hdUrl: preview.preview_base64,
      downloadToken: downloadToken,
    });

  } catch (error) {
    console.error('Order confirmation error:', error);
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 });
  }
}
