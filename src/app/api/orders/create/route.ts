import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
                    amount_cents: 199, // $1.99
                },
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Supabase error:', dbError);
            return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
        }

        // 2. Create Lemon Squeezy Checkout
        // Note: In a real app, you'd use the Lemon Squeezy API to create a checkout session.
        // For this MVP, we'll simulate a checkout URL or use a fixed product link with custom data.
        // Using a fixed link with prefilled data is the easiest way for MVP.
        // Format: https://store.lemonsqueezy.com/checkout/buy/variant_id?checkout[custom][order_id]=...

        // You need to replace this with your actual Store ID and Variant ID
        const STORE_DOMAIN = process.env.LEMONSQUEEZY_STORE_DOMAIN || 'your-store.lemonsqueezy.com';
        const VARIANT_ID = process.env.LEMONSQUEEZY_VARIANT_ID || '123456';

        // Add embed=1 for overlay checkout mode
        const checkoutUrl = `https://${STORE_DOMAIN}/checkout/buy/${VARIANT_ID}?checkout[custom][order_id]=${order.id}&embed=1`;

        return NextResponse.json({
            success: true,
            orderId: order.id,
            checkoutUrl
        });

    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
