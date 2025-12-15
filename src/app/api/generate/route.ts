import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createPreviewWithLock } from '@/utils/blur';

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

// Christmas-themed sticker prompt
const CHRISTMAS_STICKER_PROMPT = `Transform this photo into a festive Christmas chibi kawaii sticker illustration.
Style requirements:
- Adorable chibi proportions with large head and small body
- Big sparkling anime eyes with highlights
- Add a cute Santa hat on the head
- Include festive accessories (red scarf, mittens, or cozy Christmas sweater)
- Soft holiday colors (reds, greens, golds) with bold black outlines
- Add subtle sparkles or small snowflakes around the character
- Vinyl sticker aesthetic with clean edges
- Transparent background (remove all background completely)
- Keep the person's recognizable features (hair, accessories)
- Add extra rosy blush marks on cheeks for that winter glow
- Smooth, clean linework typical of Japanese kawaii style
- Make it look like a high-quality die-cut vinyl sticker with a festive Christmas vibe`;

export const maxDuration = 120;

// Security: Allowed MIME types and max file size
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const mode = formData.get('mode') as string | null;

    // Determine if Christmas mode is enabled
    const isChristmasMode = mode === 'christmas';
    const selectedPrompt = isChristmasMode ? CHRISTMAS_STICKER_PROMPT : STICKER_PROMPT;

    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Security: Validate file MIME type
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' },
        { status: 400 }
      );
    }

    // Security: Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
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
          prompt: isChristmasMode
            ? 'Photo to Christmas chibi sticker (OpenAI)'
            : 'Photo to chibi sticker (OpenAI)',
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

    console.log(`Calling OpenAI gpt-image-1... (Christmas mode: ${isChristmasMode})`);

    // 4. Call OpenAI gpt-image-1 images.edit API
    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: openaiImage,
      prompt: selectedPrompt,
      size: '1024x1024',
      background: 'transparent',
      quality: 'medium', // Faster generation (~40% faster) and lower cost (~76% cheaper)
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

    // 6. Create HD (clean) and preview (blurred with lock) versions
    const hdBuffer = Buffer.from(imageBase64, 'base64');
    const hdBase64 = `data:image/png;base64,${imageBase64}`;
    const previewBase64 = await createPreviewWithLock(hdBuffer);

    // 7. Update Supabase with both versions
    const { error: updateError } = await supabaseAdmin
      .from('preview_images')
      .update({
        status: 'ready',
        preview_base64: hdBase64, // HD version stored for after payment
        watermarked_base64: previewBase64, // Blurred version for display
      })
      .eq('id', previewId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
    }

    // Return blurred preview (paywall enabled)
    return NextResponse.json({
      success: true,
      previewId,
      previewUrl: previewBase64, // Blurred with lock
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
