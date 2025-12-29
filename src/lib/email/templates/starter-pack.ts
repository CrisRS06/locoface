import type { StarterPackContent } from '../types';

export function renderStarterPackEmail(content: StarterPackContent, codes: string[]): string {
  const codesHtml = codes
    .map(
      (code) =>
        `<div style="background: #f8f4ff; padding: 12px 20px; border-radius: 8px; font-family: monospace; font-size: 18px; color: #7c3aed; margin: 8px 0; text-align: center;">${code}</div>`
    )
    .join('');

  const instructionsHtml = content.instructions
    .map((instruction, index) => {
      if (index === 0) {
        return `<li><a href="https://locoface.com" style="color: #f472b6; text-decoration: none;">${instruction}</a></li>`;
      }
      return `<li>${instruction}</li>`;
    })
    .join('');

  return `<!DOCTYPE html>
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
        <h1 style="color: #1e293b; font-size: 24px; margin: 16px 0 8px;">${content.title}</h1>
        <p style="color: #64748b; margin: 0;">${content.subtitle}</p>
      </div>

      <!-- Success Message -->
      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 16px; padding: 20px; margin-bottom: 16px; text-align: center;">
        <p style="color: #065f46; margin: 0; font-weight: 600;">${content.successMessage}</p>
      </div>

      <!-- Codes Box -->
      <div style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px;">${content.codesTitle}</h2>
        ${codesHtml}
        <p style="color: #94a3b8; font-size: 14px; margin: 16px 0 0; text-align: center;">
          ${content.codesFooter}
        </p>
      </div>

      <!-- Instructions -->
      <div style="background: white; border-radius: 16px; padding: 24px; margin-top: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">${content.instructionsTitle}</h3>
        <ol style="color: #64748b; margin: 0; padding-left: 20px; line-height: 1.8;">
          ${instructionsHtml}
        </ol>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://locoface.com" style="display: inline-block; background: linear-gradient(135deg, #f472b6 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
          ${content.ctaButton}
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 12px;">
        <p>${content.helpText} <a href="mailto:support@locoface.com" style="color: #f472b6;">support@locoface.com</a></p>
        <p style="margin-top: 8px;">${content.copyright}</p>
      </div>
    </div>
  </body>
</html>`;
}
