import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const previewId = req.nextUrl.searchParams.get('previewId');

    if (!previewId) {
      return NextResponse.json({ error: 'Preview ID is required' }, { status: 400 });
    }

    // Find the order by preview_id and check if it's paid
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, status, hd_base64, download_token')
      .eq('preview_id', previewId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !order) {
      // Order not found or not paid yet - might still be processing via webhook
      return NextResponse.json({ error: 'Order not found or not paid' }, { status: 404 });
    }

    // Return the HD image URL
    if (order.hd_base64) {
      return NextResponse.json({
        success: true,
        hdUrl: order.hd_base64,
        downloadToken: order.download_token,
      });
    }

    // If order is paid but no HD image yet (webhook might be processing)
    return NextResponse.json({
      error: 'Image still processing',
      status: 'processing'
    }, { status: 202 });

  } catch (error) {
    console.error('Order complete error:', error);
    return NextResponse.json({ error: 'Failed to get order' }, { status: 500 });
  }
}
