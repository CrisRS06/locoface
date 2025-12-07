import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generatePromoCode, sendStarterPackCodes } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const text = await req.text();
        const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '');
        const digest = hmac.update(text).digest('hex');
        const signature = req.headers.get('x-signature');

        if (!signature || !crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(text);
        const { meta, data } = payload;
        const eventName = meta.event_name;

        if (eventName === 'order_created') {
            const customData = meta.custom_data || {};
            const orderId = customData.order_id;
            const packId = customData.pack_id;
            const purchaseType = customData.type;

            // Handle Starter Pack purchase
            if (purchaseType === 'starter_pack' && packId) {
                const buyerEmail = data.attributes.user_email;

                // 1. Generate 10 unique promo codes
                const codes: string[] = [];
                for (let i = 0; i < 10; i++) {
                    codes.push(generatePromoCode());
                }

                // 2. Insert promo codes into database
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
                    return NextResponse.json({ error: 'Failed to create codes' }, { status: 500 });
                }

                // 3. Update credit_pack status
                await supabaseAdmin
                    .from('credit_packs')
                    .update({
                        buyer_email: buyerEmail,
                        lemonsqueezy_order_id: data.id,
                        status: 'paid',
                        codes_generated: 10,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', packId);

                // 4. Send email with codes
                try {
                    await sendStarterPackCodes({
                        to: buyerEmail,
                        codes,
                    });
                } catch (emailError) {
                    console.error('Failed to send email:', emailError);
                    // Don't fail the webhook - codes are in DB
                }

                return NextResponse.json({ received: true, type: 'starter_pack' });
            }

            // Handle individual sticker purchase (existing logic)
            if (orderId) {
                // 1. Get preview data
                const { data: order } = await supabaseAdmin
                    .from('orders')
                    .select('preview_id')
                    .eq('id', orderId)
                    .single();

                if (order) {
                    const { data: preview } = await supabaseAdmin
                        .from('preview_images')
                        .select('preview_base64')
                        .eq('id', order.preview_id)
                        .single();

                    if (preview) {
                        // 2. Generate download token
                        const downloadToken = crypto.randomUUID();
                        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

                        // 3. Complete order
                        await supabaseAdmin
                            .from('orders')
                            .update({
                                status: 'paid',
                                lemonsqueezy_order_id: data.id,
                                hd_base64: preview.preview_base64,
                                download_token: downloadToken,
                                download_expires_at: expiresAt,
                                updated_at: new Date().toISOString()
                            })
                            .eq('id', orderId);
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
