import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
            const orderId = meta.custom_data?.order_id;

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
                                status: 'paid', // or 'completed' directly
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
