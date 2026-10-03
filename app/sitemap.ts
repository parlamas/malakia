// app/sitemap.ts
// Auto-generates /sitemap.xml at build time. Only lists public pages.
// Individual subject record pages (/subjects/[id]) are public but not
// enumerated here (no static list of ids) — they stay crawlable via
// links from /subjects instead. Login-required pages (/profile,
// /submit) and admin/api/auth routes are excluded entirely (also
// blocked in robots.ts).

import type { MetadataRoute } from 'next';

const BASE_URL = 'https://malakia.company';

const PUBLIC_PATHS = [
  '/',
  '/democracy',
  '/democracy/el',
  '/math/GCD',
  '/math/LCM',
  '/quotes',
  '/subjects',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: path === '/' ? BASE_URL : `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.7,
  }));
}
