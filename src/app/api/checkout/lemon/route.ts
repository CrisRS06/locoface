import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const STICKER_PRICE_CENTS = 199; // $1.99
const STARTER_PACK_PRICE_CENTS = 999; // $9.99

interface LemonSqueezyCheckoutResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      url: string;
      expires_at: string | null;
    };
  };
}

export async function POST(req: Request) {
  try {
    const { previewId, type = 'individual', email } = await req.json();

    // Validate required fields
    if (type === 'individual' && !previewId) {
      return NextResponse.json({ error: 'Preview ID is required' }, { status: 400 });
    }

    if (type === 'starter_pack' && !email) {
      return NextResponse.json({ error: 'Email is required for starter pack' }, { status: 400 });
    }

    const LEMON_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
    const VARIANT_ID_INDIVIDUAL = process.env.LEMON_SQUEEZY_VARIANT_ID_INDIVIDUAL;
    const VARIANT_ID_PACK = process.env.LEMON_SQUEEZY_VARIANT_ID_PACK;

    if (!LEMON_API_KEY || !STORE_ID) {
      console.error('Lemon Squeezy not configured');
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://locoface.com';
    let orderId: string | null = null;
    let packId: string | null = null;
    let variantId: string;

    if (type === 'individual') {
      // First, verify the preview exists
      const { data: previewCheck, error: previewError } = await supabaseAdmin
        .from('preview_images')
        .select('id, status')
        .eq('id', previewId)
        .single();

      if (previewError || !previewCheck) {
        console.error('Preview not found:', previewId, previewError);
        return NextResponse.json({
          error: 'Preview not found',
          details: `Preview ID ${previewId} does not exist in database`,
          previewError: previewError?.message
        }, { status: 404 });
      }

      console.log('Preview found:', previewCheck);

      // Create pending order in Supabase
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
        console.error('Supabase error creating order:', JSON.stringify(dbError, null, 2));
        console.error('Preview ID attempted:', previewId);
        return NextResponse.json({
          error: 'Failed to create order',
          details: dbError.message,
          code: dbError.code
        }, { status: 500 });
      }

      orderId = order.id;
      variantId = VARIANT_ID_INDIVIDUAL || '';
    } else {
      // Create pending credit pack
      const { data: pack, error: dbError } = await supabaseAdmin
        .from('credit_packs')
        .insert([
          {
            buyer_email: email,
            pack_type: 'starter',
            total_codes: 10,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (dbError) {
        console.error('Supabase error:', dbError);
        return NextResponse.json({ error: 'Failed to create pack' }, { status: 500 });
      }

      packId = pack.id;
      variantId = VARIANT_ID_PACK || '';
    }

    if (!variantId) {
      console.error('Variant ID not configured for type:', type);
      return NextResponse.json({ error: 'Product not configured' }, { status: 500 });
    }

    // Create Lemon Squeezy checkout
    const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMON_API_KEY}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: email || undefined,
              custom: {
                ...(orderId && { order_id: orderId }),
                ...(packId && { pack_id: packId }),
                ...(previewId && { preview_id: previewId }),
                type: type,
              },
            },
            checkout_options: {
              embed: true,
              media: false,
              button_color: '#FF6B9D',
            },
            product_options: {
              enabled_variants: [parseInt(variantId)],
              redirect_url: type === 'individual'
                ? `${baseUrl}/download/${orderId}`
                : `${baseUrl}/thank-you`,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: STORE_ID,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error('Lemon Squeezy checkout error:', JSON.stringify(errorData, null, 2));
      console.error('Request details - Store:', STORE_ID, 'Variant:', variantId);
      return NextResponse.json({
        error: 'Failed to create checkout',
        lemonError: errorData,
        storeId: STORE_ID,
        variantId: variantId
      }, { status: 500 });
    }

    const checkoutData: LemonSqueezyCheckoutResponse = await checkoutResponse.json();
    const checkoutUrl = checkoutData.data.attributes.url;

    // Update order/pack with checkout info
    if (orderId) {
      await supabaseAdmin
        .from('orders')
        .update({ lemon_checkout_id: checkoutData.data.id })
        .eq('id', orderId);
    }

    if (packId) {
      await supabaseAdmin
        .from('credit_packs')
        .update({ lemon_checkout_id: checkoutData.data.id })
        .eq('id', packId);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl,
      orderId,
      packId,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
