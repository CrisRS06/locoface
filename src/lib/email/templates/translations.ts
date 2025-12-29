import type { Locale, StarterPackContent } from '../types';

export const starterPackTranslations: Record<Locale, StarterPackContent> = {
  es: {
    subject: '🎉 Tus 9 códigos bonus de LocoFace!',
    title: '¡Tu Starter Pack está activado!',
    subtitle: 'Ya desbloqueaste tu primer sticker. Aquí están tus códigos restantes.',
    successMessage: '✓ 1 sticker HD ya desbloqueado y listo para descargar',
    codesTitle: 'Tus 9 códigos bonus:',
    codesFooter: 'Cada código = 1 sticker gratis • Los códigos nunca expiran',
    instructionsTitle: '¿Cómo usar tus códigos?',
    instructions: [
      'Ve a locoface.com',
      'Sube tu foto',
      'En el checkout, ingresa tu código',
      '¡Descarga tu sticker HD!',
    ],
    ctaButton: 'Crear otro sticker',
    helpText: '¿Preguntas? Escríbenos a',
    copyright: '© 2025 LocoFace. Todos los derechos reservados.',
  },
  en: {
    subject: '🎉 Your 9 bonus LocoFace codes!',
    title: 'Your Starter Pack is activated!',
    subtitle: 'You already unlocked your first sticker. Here are your remaining codes.',
    successMessage: '✓ 1 HD sticker already unlocked and ready to download',
    codesTitle: 'Your 9 bonus codes:',
    codesFooter: 'Each code = 1 free sticker • Codes never expire',
    instructionsTitle: 'How to use your codes?',
    instructions: [
      'Go to locoface.com',
      'Upload your photo',
      'At checkout, enter your code',
      'Download your HD sticker!',
    ],
    ctaButton: 'Create another sticker',
    helpText: 'Questions? Contact us at',
    copyright: '© 2025 LocoFace. All rights reserved.',
  },
};
