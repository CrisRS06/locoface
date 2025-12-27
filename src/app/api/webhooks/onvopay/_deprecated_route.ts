import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateAndInsertPromoCode, sendStarterPackCodes } from '@/lib/email';

interface OnvoWebhookPayload {
  type: string;
  data: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    metadata?: {
      order_id?: string;
      pack_id?: string;
      type?: string;
    };
    customer?: {
      id?: string;
      email?: string;
      name?: string;
    };
    createdAt: string;
  };
}

export async function POST(req: Request) {
  try {
    // 1. Validate webhook secret from header
    const webhookSecret = req.headers.get('x-webhook-secret');

    if (!webhookSecret || webhookSecret !== process.env.ONVO_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
    }

    const payload: OnvoWebhookPayload = await req.json();
    const { type, data } = payload;

    // 2. Handle payment succeeded event
    if (type === 'payment-intent.succeeded') {
      const { metadata, id: paymentIntentId, customer } = data;
      const purchaseType = metadata?.type;
      const orderId = metadata?.order_id;
      const packId = metadata?.pack_id;

      // 2a. Handle Starter Pack purchase
      if (purchaseType === 'starter_pack' && packId) {
        // Check if already processed (idempotency)
        const { data: existingPack } = await supabaseAdmin
          .from('credit_packs')
          .select('status')
          .eq('id', packId)
          .single();

        if (existingPack?.status === 'paid') {
          return NextResponse.json({ received: true, message: 'Already processed' });
        }

        const buyerEmail = customer?.email || '';

        // Generate 10 unique promo codes with retry logic (inserts one by one)
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
          const code = await generateAndInsertPromoCode(supabaseAdmin, packId, buyerEmail);
          if (code) {
            codes.push(code);
          }
        }

        if (codes.length === 0) {
          console.error('Failed to generate any promo codes for pack:', packId);
          return NextResponse.json({ received: true, error: 'Failed to create codes' });
        }

        if (codes.length < 10) {
          console.warn(`Only generated ${codes.length}/10 codes for pack ${packId}`);
        }

        // Update credit_pack status
        await supabaseAdmin
          .from('credit_packs')
          .update({
            buyer_email: buyerEmail,
            onvo_payment_intent_id: paymentIntentId,
            status: 'paid',
            codes_generated: codes.length,
            updated_at: new Date().toISOString(),
          })
          .eq('id', packId);

        // Send email with codes
        if (buyerEmail) {
          try {
            await sendStarterPackCodes({ to: buyerEmail, codes });
          } catch (emailError) {
            console.error('Failed to send starter pack email:', emailError);
          }
        }

        return NextResponse.json({ received: true, type: 'starter_pack' });
      }

      // 2b. Handle individual sticker purchase
      if (purchaseType === 'individual' && orderId) {
        // Check if already processed (idempotency)
        const { data: existingOrder } = await supabaseAdmin
          .from('orders')
          .select('status, preview_id')
          .eq('id', orderId)
          .single();

        if (existingOrder?.status === 'paid') {
          return NextResponse.json({ received: true, message: 'Already processed' });
        }

        if (existingOrder) {
          // Get preview image
          const { data: preview } = await supabaseAdmin
            .from('preview_images')
            .select('preview_base64')
            .eq('id', existingOrder.preview_id)
            .single();

          if (preview) {
            // Generate download token
            const downloadToken = crypto.randomUUID();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

            // Complete order
            await supabaseAdmin
              .from('orders')
              .update({
                status: 'paid',
                onvo_payment_intent_id: paymentIntentId,
                hd_base64: preview.preview_base64,
                download_token: downloadToken,
                download_expires_at: expiresAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', orderId);
          }
        }

        return NextResponse.json({ received: true, type: 'individual' });
      }
    }

    // 3. Handle payment failed event
    if (type === 'payment-intent.failed') {
      const { metadata } = data;

      if (metadata?.order_id) {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', metadata.order_id);
      }

      if (metadata?.pack_id) {
        await supabaseAdmin
          .from('credit_packs')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', metadata.pack_id);
      }
    }

    // Always return 200 to acknowledge webhook receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ received: true, error: 'Internal error' });
  }
}
