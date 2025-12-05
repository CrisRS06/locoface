import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Edge runtime for fast response
export const runtime = 'edge';

// Image dimensions for social sharing (1.91:1 ratio)
const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ previewId: string }> }
) {
  try {
    const { previewId } = await params;

    if (!previewId) {
      return new Response('Preview ID is required', { status: 400 });
    }

    // Fetch the preview image from Supabase
    const { data: preview, error } = await supabaseAdmin
      .from('preview_images')
      .select('watermarked_base64')
      .eq('id', previewId)
      .single();

    if (error || !preview?.watermarked_base64) {
      // Return a default OG image if preview not found
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #E5DEFF 0%, #FFC8DD 50%, #FFB5A7 100%)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
                background: 'linear-gradient(135deg, #FFB5A7 0%, #FFC8DD 100%)',
                borderRadius: 32,
                marginBottom: 32,
                boxShadow: '0 20px 60px rgba(255, 181, 167, 0.4)',
              }}
            >
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#1e293b',
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              Locoface
            </div>
            <div
              style={{
                fontSize: 28,
                color: '#475569',
                textAlign: 'center',
              }}
            >
              Turn your photo into cute stickers
            </div>
          </div>
        ),
        { width: WIDTH, height: HEIGHT }
      );
    }

    // Generate OG image with the sticker
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #E5DEFF 0%, #FFC8DD 50%, #FFB5A7 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Sticker Image */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 400,
              height: 400,
              borderRadius: 40,
              background: 'rgba(255, 255, 255, 0.6)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              marginBottom: 32,
              overflow: 'hidden',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.watermarked_base64}
              alt="Sticker"
              style={{
                width: 360,
                height: 360,
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #FFB5A7 0%, #FFC8DD 100%)',
                borderRadius: 12,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
              </svg>
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#1e293b',
              }}
            >
              Made with Locoface.com
            </div>
          </div>
        </div>
      ),
      { width: WIDTH, height: HEIGHT }
    );
  } catch (error) {
    console.error('OG image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
