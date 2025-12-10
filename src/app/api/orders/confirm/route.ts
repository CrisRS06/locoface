import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, previewId } = await req.json();

    console.log('=== /api/orders/confirm CALLED ===');
    console.log('Received paymentIntentId:', paymentIntentId);
    console.log('Received previewId:', previewId);

    if (!paymentIntentId || !previewId) {
      console.log('ERROR: Missing required params');
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

    console.log('Order query result:', { order, orderError: orderError?.message || null });

    if (orderError || !order) {
      console.log('ERROR: Order not found - Mode #6 suspected');
      // Try to find order by just previewId to debug
      const { data: orderByPreview } = await supabaseAdmin
        .from('orders')
        .select('id, status, preview_id, onvo_payment_intent_id')
        .eq('preview_id', previewId)
        .single();
      console.log('Order by previewId only:', orderByPreview);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('Order found, current status:', order.status);

    // 2. If already paid, return the HD image
    if (order.status === 'paid') {
      console.log('Order already paid, returning HD image');
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

    console.log('Verifying with Onvo API at:', `${ONVO_API_URL}/payment-intents/${paymentIntentId}`);

    if (!ONVO_SECRET_KEY) {
      console.log('ERROR: ONVO_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const verifyResponse = await fetch(`${ONVO_API_URL}/payment-intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ONVO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Onvo API response status:', verifyResponse.status);

    if (!verifyResponse.ok) {
      const errorText = await verifyResponse.text();
      console.error('ERROR: Onvo API failed - Mode #7 suspected');
      console.error('Onvo API error response:', errorText);
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }

    const paymentIntent = await verifyResponse.json();
    console.log('Onvo PaymentIntent status:', paymentIntent.status);
    console.log('Onvo PaymentIntent full:', JSON.stringify(paymentIntent, null, 2));

    // 4. Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      console.log('ERROR: Payment not succeeded - Mode #8 suspected, status:', paymentIntent.status);
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
        message: 'Payment not yet completed',
      }, { status: 202 });
    }

    console.log('Payment succeeded! Proceeding to update order...');

    // 5. Payment succeeded - update order and generate HD image
    // Get preview image to use as HD (same as webhook logic)
    const { data: preview, error: previewError } = await supabaseAdmin
      .from('preview_images')
      .select('preview_base64')
      .eq('id', previewId)
      .single();

    console.log('Preview query result:', {
      hasPreview: !!preview,
      hasBase64: !!preview?.preview_base64,
      previewError: previewError?.message || null
    });

    if (!preview?.preview_base64) {
      console.log('ERROR: Preview image not found - Mode #9 suspected');
      return NextResponse.json({ error: 'Preview image not found' }, { status: 404 });
    }

    // Generate download token
    const downloadToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    console.log('Updating order to paid, order.id:', order.id);

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
      console.error('ERROR: Failed to update order - Mode #10 suspected');
      console.error('Update error details:', JSON.stringify(updateError));
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    console.log('SUCCESS! Order updated to paid, returning HD image');

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
