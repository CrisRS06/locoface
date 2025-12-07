import sharp from 'sharp';

/**
 * Applies a blur effect to an image for preview purposes
 * The blur makes the sticker visible but not usable without payment
 */
export async function applyBlur(imageBuffer: Buffer): Promise<string> {
  const blurredBuffer = await sharp(imageBuffer)
    .blur(15) // Strong blur to prevent screenshot usage
    .png()
    .toBuffer();

  return `data:image/png;base64,${blurredBuffer.toString('base64')}`;
}

/**
 * Creates a preview image with blur and lock overlay
 */
export async function createPreviewWithLock(imageBuffer: Buffer): Promise<string> {
  const width = 1024;
  const height = 1024;

  // Create lock overlay SVG
  const lockOverlaySvg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgba(0,0,0,0.3);stop-opacity:1" />
          <stop offset="100%" style="stop-color:rgba(0,0,0,0.5);stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Semi-transparent overlay -->
      <rect width="100%" height="100%" fill="url(#lockGrad)" />
      <!-- Lock icon background -->
      <circle cx="512" cy="450" r="60" fill="white" opacity="0.95"/>
      <!-- Lock body -->
      <rect x="482" y="440" width="60" height="45" rx="8" fill="#374151"/>
      <!-- Lock shackle -->
      <path d="M 492 440 L 492 420 A 20 20 0 0 1 532 420 L 532 440"
            fill="none" stroke="#374151" stroke-width="8" stroke-linecap="round"/>
      <!-- Keyhole -->
      <circle cx="512" cy="458" r="6" fill="white"/>
      <rect x="509" y="458" width="6" height="12" fill="white"/>
    </svg>
  `;

  // Apply blur and overlay
  const blurredWithLock = await sharp(imageBuffer)
    .blur(12)
    .composite([{
      input: Buffer.from(lockOverlaySvg),
      blend: 'over'
    }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${blurredWithLock.toString('base64')}`;
}
