import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Optimized prompt for chibi/kawaii sticker transformation
const STICKER_PROMPT = `Transform this photo into a cute chibi kawaii sticker illustration.
Style requirements:
- Adorable chibi proportions with large head and small body
- Big sparkling anime eyes with highlights
- Soft pastel colors with bold black outlines
- Vinyl sticker aesthetic with clean edges
- Transparent background (remove all background completely)
- Keep the person's recognizable features (hair, accessories, clothing style)
- Add subtle rosy blush marks on cheeks
- Smooth, clean linework typical of Japanese kawaii style
- Make it look like a high-quality die-cut vinyl sticker`;

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // 1. Create preview record in Supabase
    const { data: preview, error: dbError } = await supabaseAdmin
      .from('preview_images')
      .insert([
        {
          user_id: null,
          prompt: 'Photo to chibi sticker (OpenAI)',
          status: 'generating',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create preview record' },
        { status: 500 }
      );
    }

    const previewId = preview.id;

    // 2. Convert uploaded File to Buffer
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    // 3. Prepare image for OpenAI API using toFile helper
    const openaiImage = await toFile(imageBuffer, 'input.png', {
      type: 'image/png',
    });

    console.log('Calling OpenAI gpt-image-1...');

    // 4. Call OpenAI gpt-image-1 images.edit API
    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: openaiImage,
      prompt: STICKER_PROMPT,
      size: '1024x1024',
      background: 'transparent',
    });

    // 5. Extract base64 image from response
    if (!response.data || response.data.length === 0) {
      console.error('No data in OpenAI response');
      throw new Error('No image data in OpenAI response');
    }

    const imageData = response.data[0];

    if (!imageData.b64_json) {
      console.error('No image data in OpenAI response');
      throw new Error('No image data in OpenAI response');
    }

    const imageBase64 = imageData.b64_json;
    console.log('OpenAI image generated successfully');

    // 6. Clean image (paywall disabled - no watermark)
    const cleanBase64 = `data:image/png;base64,${imageBase64}`;

    // 7. Update Supabase with results
    const { error: updateError } = await supabaseAdmin
      .from('preview_images')
      .update({
        status: 'ready',
        preview_base64: cleanBase64,
      })
      .eq('id', previewId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
    }

    // Return clean image directly (paywall disabled)
    return NextResponse.json({
      success: true,
      previewId,
      watermarkedUrl: cleanBase64, // No watermark for now
    });

  } catch (error) {
    console.error('Generation error:', error);

    // Provide specific error messages for OpenAI errors
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API Error:', error.status, error.message);

      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key' },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.status === 400) {
        return NextResponse.json(
          { error: 'Invalid image format. Please try a different photo.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate sticker' },
      { status: 500 }
    );
  }
}
