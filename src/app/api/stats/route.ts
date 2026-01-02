import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get count of paid stickers (completed purchases)
    const { count, error } = await supabase
      .from('preview_images')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid');

    if (error) {
      console.error('Error fetching stats:', error);
      // Return fallback values (inflated for social proof)
      return NextResponse.json({
        stickerCount: 847000,
        viewingNow: Math.floor(Math.random() * 20) + 15,
      });
    }

    // Inflated base count for social proof (marketing)
    const baseCount = 847000; // ~850K for impressive social proof
    // Add real sales multiplied for perceived growth
    const totalCount = baseCount + ((count || 0) * 10);

    // Simulate "viewing now" - random between 12-35 for realism
    // In production, you could use Redis or real-time analytics
    const viewingNow = Math.floor(Math.random() * 24) + 12;

    return NextResponse.json({
      stickerCount: totalCount,
      viewingNow,
    }, {
      headers: {
        // Cache for 60 seconds to reduce DB calls
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      stickerCount: 847000,
      viewingNow: Math.floor(Math.random() * 20) + 15,
    });
  }
}
