// app/robots.ts
// Auto-generates /robots.txt. Blocks admin, API, and auth routes, plus
// the two login-required personal pages (/profile, /submit) from being
// crawled/indexed. Individual subject record pages (/subjects/[id])
// are intentionally left crawlable — they're public.

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/api',
        '/api/',
        '/auth',
        '/auth/',
        '/profile',
        '/submit',
      ],
    },
    sitemap: 'https://malakia.company/sitemap.xml',
  };
}
