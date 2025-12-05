import sharp from 'sharp';

export async function applyWatermark(imageBuffer: Buffer): Promise<string> {
    const width = 1024;
    const height = 1024;

    const watermarkSvg = `
    <svg width="${width}" height="${height}">
      <style>
        .text { fill: rgba(255, 255, 255, 0.5); font-size: 80px; font-weight: bold; font-family: sans-serif; }
        .shadow { fill: rgba(0, 0, 0, 0.5); font-size: 80px; font-weight: bold; font-family: sans-serif; }
      </style>
      <!-- Central Watermark -->
      <text x="50%" y="50%" text-anchor="middle" class="shadow" transform="rotate(-30, 512, 512)">Simple Sticker</text>
      <text x="50%" y="50%" text-anchor="middle" class="text" transform="translate(-2, -2) rotate(-30, 512, 512)">Simple Sticker</text>
      
      <!-- Corner Watermarks -->
      <text x="20%" y="20%" text-anchor="middle" class="shadow" font-size="40" transform="rotate(-30, 204, 204)">Preview</text>
      <text x="20%" y="20%" text-anchor="middle" class="text" font-size="40" transform="translate(-2, -2) rotate(-30, 204, 204)">Preview</text>
      
      <text x="80%" y="80%" text-anchor="middle" class="shadow" font-size="40" transform="rotate(-30, 819, 819)">Preview</text>
      <text x="80%" y="80%" text-anchor="middle" class="text" font-size="40" transform="translate(-2, -2) rotate(-30, 819, 819)">Preview</text>
    </svg>
  `;

    const watermarkedBuffer = await sharp(imageBuffer)
        .composite([{
            input: Buffer.from(watermarkSvg),
            blend: 'over'
        }])
        .png()
        .toBuffer();

    return `data:image/png;base64,${watermarkedBuffer.toString('base64')}`;
}
