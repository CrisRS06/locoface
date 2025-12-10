import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true, // Auto-detect based on browser Accept-Language
  localePrefix: 'always', // Always show /en/ or /es/ in URL
});

export const config = {
  // Match all pathnames except for API routes, static files, etc.
  matcher: [
    '/',
    '/(en|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
