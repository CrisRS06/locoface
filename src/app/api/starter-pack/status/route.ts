import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const packId = searchParams.get('packId');

    if (!packId) {
      return NextResponse.json({ error: 'Pack ID is required' }, { status: 400 });
    }

    const { data: pack, error } = await supabaseAdmin
      .from('credit_packs')
      .select('status, hd_base64')
      .eq('id', packId)
      .single();

    if (error || !pack) {
      return NextResponse.json({
        found: false,
        status: 'invalid'
      });
    }

    return NextResponse.json({
      found: true,
      status: pack.status,
      hdUrl: pack.status === 'paid' ? pack.hd_base64 : null,
    });
  } catch (error) {
    console.error('Error checking pack status:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
