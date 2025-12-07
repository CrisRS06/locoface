import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
    try {
        // 1. Create pending credit_pack record
        const { data: pack, error: packError } = await supabaseAdmin
            .from('credit_packs')
            .insert([
                {
                    buyer_email: '', // Will be filled by webhook
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

        // 2. Create LemonSqueezy Checkout URL
        // Using LemonSqueezy API to create checkout session
        const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
        const STARTER_VARIANT_ID = process.env.LEMONSQUEEZY_STARTER_VARIANT_ID;

        if (!STORE_ID || !STARTER_VARIANT_ID) {
            console.error('Missing LemonSqueezy config');
            return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
        }

        // Create checkout via LemonSqueezy API
        const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
                'Content-Type': 'application/vnd.api+json',
                'Accept': 'application/vnd.api+json',
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        custom_price: null,
                        product_options: {
                            enabled_variants: [parseInt(STARTER_VARIANT_ID)],
                        },
                        checkout_options: {
                            embed: true,
                            media: false,
                            button_color: '#f472b6',
                        },
                        checkout_data: {
                            custom: {
                                pack_id: pack.id,
                                type: 'starter_pack',
                            },
                        },
                        expires_at: null,
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
                                id: STARTER_VARIANT_ID,
                            },
                        },
                    },
                },
            }),
        });

        if (!checkoutResponse.ok) {
            const errorData = await checkoutResponse.json();
            console.error('LemonSqueezy checkout error:', errorData);
            return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
        }

        const checkoutData = await checkoutResponse.json();
        const checkoutUrl = checkoutData.data.attributes.url;

        return NextResponse.json({
            success: true,
            packId: pack.id,
            checkoutUrl,
        });

    } catch (error) {
        console.error('Starter pack checkout error:', error);
        return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }
}
