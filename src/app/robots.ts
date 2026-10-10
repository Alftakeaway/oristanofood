import type { MetadataRoute } from 'next';
import { resolveBaseUrl } from '@/lib/base-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${resolveBaseUrl()}/sitemap.xml`,
  };
}
