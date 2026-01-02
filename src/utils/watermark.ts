import sharp from 'sharp';

/**
 * Applies a visible watermark pattern with "LOCOFACE.COM"
 * The image is shown clearly (no blur) but with watermark overlay
 * This builds trust by showing the actual result while protecting the asset
 */
export async function applyWatermark(imageBuffer: Buffer): Promise<string> {
    const width = 1024;
    const height = 1024;

    // Create a repeated diagonal pattern watermark
    // Semi-transparent but visible - builds trust while protecting
    const watermarkSvg = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark {
          fill: rgba(0, 0, 0, 0.25);
          font-size: 48px;
          font-weight: 800;
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: 2px;
        }
        .watermark-light {
          fill: rgba(255, 255, 255, 0.35);
          font-size: 48px;
          font-weight: 800;
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: 2px;
        }
      </style>

      <!-- Repeated diagonal watermark pattern - prevents cropping -->
      <!-- Row 1 -->
      <text x="0" y="100" class="watermark" transform="rotate(-25, 0, 100)">LOCOFACE.COM</text>
      <text x="2" y="102" class="watermark-light" transform="rotate(-25, 0, 100)">LOCOFACE.COM</text>

      <text x="500" y="100" class="watermark" transform="rotate(-25, 500, 100)">LOCOFACE.COM</text>
      <text x="502" y="102" class="watermark-light" transform="rotate(-25, 500, 100)">LOCOFACE.COM</text>

      <!-- Row 2 -->
      <text x="-100" y="350" class="watermark" transform="rotate(-25, -100, 350)">LOCOFACE.COM</text>
      <text x="-98" y="352" class="watermark-light" transform="rotate(-25, -100, 350)">LOCOFACE.COM</text>

      <text x="400" y="350" class="watermark" transform="rotate(-25, 400, 350)">LOCOFACE.COM</text>
      <text x="402" y="352" class="watermark-light" transform="rotate(-25, 400, 350)">LOCOFACE.COM</text>

      <text x="900" y="350" class="watermark" transform="rotate(-25, 900, 350)">LOCOFACE.COM</text>
      <text x="902" y="352" class="watermark-light" transform="rotate(-25, 900, 350)">LOCOFACE.COM</text>

      <!-- Row 3 - Center -->
      <text x="100" y="550" class="watermark" transform="rotate(-25, 100, 550)">LOCOFACE.COM</text>
      <text x="102" y="552" class="watermark-light" transform="rotate(-25, 100, 550)">LOCOFACE.COM</text>

      <text x="600" y="550" class="watermark" transform="rotate(-25, 600, 550)">LOCOFACE.COM</text>
      <text x="602" y="552" class="watermark-light" transform="rotate(-25, 600, 550)">LOCOFACE.COM</text>

      <!-- Row 4 -->
      <text x="-50" y="750" class="watermark" transform="rotate(-25, -50, 750)">LOCOFACE.COM</text>
      <text x="-48" y="752" class="watermark-light" transform="rotate(-25, -50, 750)">LOCOFACE.COM</text>

      <text x="450" y="750" class="watermark" transform="rotate(-25, 450, 750)">LOCOFACE.COM</text>
      <text x="452" y="752" class="watermark-light" transform="rotate(-25, 450, 750)">LOCOFACE.COM</text>

      <text x="950" y="750" class="watermark" transform="rotate(-25, 950, 750)">LOCOFACE.COM</text>
      <text x="952" y="752" class="watermark-light" transform="rotate(-25, 950, 750)">LOCOFACE.COM</text>

      <!-- Row 5 -->
      <text x="200" y="950" class="watermark" transform="rotate(-25, 200, 950)">LOCOFACE.COM</text>
      <text x="202" y="952" class="watermark-light" transform="rotate(-25, 200, 950)">LOCOFACE.COM</text>

      <text x="700" y="950" class="watermark" transform="rotate(-25, 700, 950)">LOCOFACE.COM</text>
      <text x="702" y="952" class="watermark-light" transform="rotate(-25, 700, 950)">LOCOFACE.COM</text>
    </svg>
  `;

    // Apply watermark WITHOUT blur - user sees the actual sticker clearly
    const watermarkedBuffer = await sharp(imageBuffer)
        .composite([{
            input: Buffer.from(watermarkSvg),
            blend: 'over'
        }])
        .png()
        .toBuffer();

    return `data:image/png;base64,${watermarkedBuffer.toString('base64')}`;
}
