import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generatePromoCode, sendStarterPackCodes } from '@/lib/email';

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

    console.log(`Onvo webhook received: ${type}`, { paymentIntentId: data.id });

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
          console.log('Starter pack already processed:', packId);
          return NextResponse.json({ received: true, message: 'Already processed' });
        }

        const buyerEmail = customer?.email || '';

        // Generate 10 unique promo codes
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
          codes.push(generatePromoCode());
        }

        // Insert promo codes into database
        const promoCodesData = codes.map(code => ({
          code,
          discount_percent: 100, // Free sticker
          max_uses: 1,
          current_uses: 0,
          is_active: true,
          pack_id: packId,
          buyer_email: buyerEmail,
        }));

        const { error: codesError } = await supabaseAdmin
          .from('promo_codes')
          .insert(promoCodesData);

        if (codesError) {
          console.error('Failed to insert promo codes:', codesError);
          // Return 200 anyway to prevent webhook retries
          return NextResponse.json({ received: true, error: 'Failed to create codes' });
        }

        // Update credit_pack status
        await supabaseAdmin
          .from('credit_packs')
          .update({
            buyer_email: buyerEmail,
            onvo_payment_intent_id: paymentIntentId,
            status: 'paid',
            codes_generated: 10,
            updated_at: new Date().toISOString(),
          })
          .eq('id', packId);

        // Send email with codes
        if (buyerEmail) {
          try {
            await sendStarterPackCodes({ to: buyerEmail, codes });
            console.log('Starter pack codes sent to:', buyerEmail);
          } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the webhook - codes are in DB
          }
        }

        console.log('Starter pack processed successfully:', packId);
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
          console.log('Order already processed:', orderId);
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

            console.log('Order processed successfully:', orderId);
          }
        }

        return NextResponse.json({ received: true, type: 'individual' });
      }
    }

    // 3. Handle payment failed event (for logging)
    if (type === 'payment-intent.failed') {
      const { metadata, id: paymentIntentId } = data;
      console.error('Payment failed:', {
        paymentIntentId,
        metadata,
        error: data,
      });

      // Optionally update order/pack status to failed
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
    // Return 200 anyway to prevent infinite retries
    return NextResponse.json({ received: true, error: 'Internal error' });
  }
}
