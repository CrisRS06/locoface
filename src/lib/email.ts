import { Resend } from 'resend';

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
}

export async function sendStarterPackCodes({ to, codes }: StarterPackEmailParams) {
  const codesHtml = codes.map(code =>
    `<div style="background: #f8f4ff; padding: 12px 20px; border-radius: 8px; font-family: monospace; font-size: 18px; color: #7c3aed; margin: 8px 0; text-align: center;">${code}</div>`
  ).join('');

  const { data, error } = await getResend().emails.send({
    from: 'LocoFace <noreply@locoface.com>',
    to,
    subject: '🎉 Tus 9 códigos bonus de LocoFace!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf5ff;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://locoface.com/logo-full.png" alt="LocoFace" style="width: 80px; height: 80px;">
              <h1 style="color: #1e293b; font-size: 24px; margin: 16px 0 8px;">¡Tu Starter Pack está activado!</h1>
              <p style="color: #64748b; margin: 0;">Ya desbloqueaste tu primer sticker. Aquí están tus códigos restantes.</p>
            </div>

            <!-- Success Message -->
            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 16px; padding: 20px; margin-bottom: 16px; text-align: center;">
              <p style="color: #065f46; margin: 0; font-weight: 600;">✓ 1 sticker HD ya desbloqueado y listo para descargar</p>
            </div>

            <!-- Codes Box -->
            <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px;">Tus 9 códigos bonus:</h2>
              ${codesHtml}
              <p style="color: #94a3b8; font-size: 14px; margin: 16px 0 0; text-align: center;">
                Cada código = 1 sticker gratis • Los códigos nunca expiran
              </p>
            </div>

            <!-- Instructions -->
            <div style="background: white; border-radius: 16px; padding: 24px; margin-top: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">¿Cómo usar tus códigos?</h3>
              <ol style="color: #64748b; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Ve a <a href="https://locoface.com" style="color: #f472b6; text-decoration: none;">locoface.com</a></li>
                <li>Sube tu foto</li>
                <li>En el checkout, ingresa tu código</li>
                <li>¡Descarga tu sticker HD!</li>
              </ol>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://locoface.com" style="display: inline-block; background: linear-gradient(135deg, #f472b6 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                Crear otro sticker
              </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px;">
              <p>¿Preguntas? Escríbenos a <a href="mailto:support@locoface.com" style="color: #f472b6;">support@locoface.com</a></p>
              <p style="margin-top: 8px;">© 2025 LocoFace. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
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

    const { error } = await supabase
      .from('promo_codes')
      .insert({
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
