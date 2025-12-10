import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://locoface.com';
  const locales = ['en', 'es'];

  const staticPages = [
    '',        // homepage
    '/terms',
    '/privacy',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add localized versions of each page
  for (const locale of locales) {
    for (const page of staticPages) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'monthly',
        priority: page === '' ? 1.0 : 0.5,
      });
    }
  }

  return sitemapEntries;
}
