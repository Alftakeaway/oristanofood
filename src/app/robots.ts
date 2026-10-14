import { DEMO_MODE } from "@/lib/demo-mode";
import type { MetadataRoute } from 'next';
import { resolveBaseUrl } from '@/lib/base-url';

export default function robots(): MetadataRoute.Robots {
  if (DEMO_MODE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${resolveBaseUrl()}/sitemap.xml`,
  };
}
