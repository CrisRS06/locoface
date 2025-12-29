import { Resend } from 'resend';
import type { Locale } from './types';
import { starterPackTranslations } from './templates/translations';
import { renderStarterPackEmail } from './templates/starter-pack';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

interface StarterPackEmailParams {
  to: string;
  codes: string[];
  locale?: Locale;
}

export async function sendStarterPackCodes({
  to,
  codes,
  locale = 'es',
}: StarterPackEmailParams) {
  // Get translations with fallback to Spanish
  const content = starterPackTranslations[locale] || starterPackTranslations.es;
  const html = renderStarterPackEmail(content, codes);

  const { data, error } = await getResend().emails.send({
    from: 'LocoFace <noreply@locoface.com>',
    to,
    subject: content.subject,
    html,
  });

  if (error) {
    console.error('Email send error:', error);
    throw error;
  }

  return data;
}

// Generate a unique promo code in format LOCO-XXXXXX
export function generatePromoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like 0/O, 1/I
  let code = 'LOCO-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate and insert a promo code with retry logic for duplicates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateAndInsertPromoCode(
  supabase: any,
  packId?: string,
  buyerEmail?: string
): Promise<string | null> {
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generatePromoCode();

    const { error } = await supabase.from('promo_codes').insert({
      code,
      max_uses: 1,
      current_uses: 0,
      is_active: true,
      pack_id: packId || null,
      buyer_email: buyerEmail || null,
    });

    if (!error) return code;

    // Error 23505 is UNIQUE constraint violation (duplicate)
    if (error.code !== '23505') {
      console.error('Error inserting promo code:', error);
      return null;
    }
    // If duplicate, retry with a new code
    console.log(`Promo code collision (attempt ${attempt + 1}), retrying...`);
  }

  console.error('Failed to generate unique promo code after max attempts');
  return null;
}
