import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateAndInsertPromoCode, sendStarterPackCodes } from '@/lib/email';

interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      order_id?: string;
      pack_id?: string;
      preview_id?: string;
      type?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      identifier: string;
      order_number: number;
      user_name: string;
      user_email: string;
      currency: string;
      currency_rate: string;
      subtotal: number;
      discount_total: number;
      tax: number;
      total: number;
      subtotal_usd: number;
      discount_total_usd: number;
      tax_usd: number;
      total_usd: number;
      status: string;
      status_formatted: string;
      refunded: boolean;
      refunded_at: string | null;
      created_at: string;
      updated_at: string;
    };
  };
}

// Verify webhook signature from Lemon Squeezy
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await req.text();

    // Validate webhook signature
    const signature = req.headers.get('x-signature');
    const webhookSecret = process.env.LEMON_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('LEMON_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!signature || !verifySignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: LemonSqueezyWebhookPayload = JSON.parse(rawBody);
    const { meta, data } = payload;
    const eventName = meta.event_name;

    console.log('Lemon Squeezy webhook received:', eventName);

    // Handle order_created event
    if (eventName === 'order_created') {
      const customData = meta.custom_data;
      const purchaseType = customData?.type;
      const orderId = customData?.order_id;
      const packId = customData?.pack_id;
      const previewId = customData?.preview_id;
      const buyerEmail = data.attributes.user_email;
      const lemonOrderId = data.id;

      // Handle Starter Pack purchase
      if (purchaseType === 'starter_pack' && packId) {
        // Check if already processed (idempotency)
        const { data: existingPack } = await supabaseAdmin
          .from('credit_packs')
          .select('status, preview_id, locale')
          .eq('id', packId)
          .single();

        if (existingPack?.status === 'paid') {
          return NextResponse.json({ received: true, message: 'Already processed' });
        }

        // Generate 10 unique promo codes
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

        // Get the HD sticker to unlock (from preview_id stored in pack)
        let hdBase64: string | null = null;
        const packPreviewId = existingPack?.preview_id;

        if (packPreviewId && codes[0]) {
          // Get the preview image to unlock
          const { data: preview } = await supabaseAdmin
            .from('preview_images')
            .select('preview_base64')
            .eq('id', packPreviewId)
            .single();

          if (preview?.preview_base64) {
            hdBase64 = preview.preview_base64;

            // Mark first code as used (for the instant unlock)
            await supabaseAdmin
              .from('promo_codes')
              .update({ current_uses: 1 })
              .eq('code', codes[0]);
          }
        }

        // Update credit_pack with email, HD image, and paid status
        await supabaseAdmin
          .from('credit_packs')
          .update({
            buyer_email: buyerEmail,
            lemon_order_id: lemonOrderId,
            hd_base64: hdBase64,
            status: 'paid',
            codes_generated: codes.length,
            updated_at: new Date().toISOString(),
          })
          .eq('id', packId);

        // Send email with remaining 9 codes (first was used for instant unlock)
        if (buyerEmail && codes.length > 1) {
          try {
            await sendStarterPackCodes({
              to: buyerEmail,
              codes: codes.slice(1),
              locale: (existingPack?.locale as 'en' | 'es') || 'es',
            });
          } catch (emailError) {
            console.error('Failed to send starter pack email:', emailError);
          }
        }

        return NextResponse.json({ received: true, type: 'starter_pack' });
      }

      // Handle individual sticker purchase
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
            .eq('id', previewId || existingOrder.preview_id)
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
                lemon_order_id: lemonOrderId,
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

    // Handle order_refunded event
    if (eventName === 'order_refunded') {
      const customData = meta.custom_data;

      if (customData?.order_id) {
        await supabaseAdmin
          .from('orders')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('id', customData.order_id);
      }

      if (customData?.pack_id) {
        await supabaseAdmin
          .from('credit_packs')
          .update({ status: 'refunded', updated_at: new Date().toISOString() })
          .eq('id', customData.pack_id);
      }
    }

    // Always return 200 to acknowledge webhook receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    // Return 200 to prevent retries for parsing errors
    return NextResponse.json({ received: true, error: 'Internal error' });
  }
}
