import { Redis } from '@upstash/redis';
import type { ShowcaseItem, SiteData } from './site-data';
import type { HourException } from './open-status';

// Override runtime (modifiche via WhatsApp) separati dal JSON base:
// il file resta la base versionata in git, gli override vivono in Redis.
// Chiave singola con le due liste che il webhook modifica.
export interface SiteOverrides {
  showcase: ShowcaseItem[];
  exceptions: HourException[];
}

const KEY = 'site:overrides:v1';

let client: Redis | null | undefined;

function getClient(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export function isRedisConfigured(): boolean {
  return getClient() !== null;
}

export async function loadOverrides(): Promise<SiteOverrides | null> {
  const redis = getClient();
  if (!redis) return null;
  try {
    const raw = await redis.get<SiteOverrides>(KEY);
    if (!raw || !Array.isArray(raw.showcase) || !Array.isArray(raw.exceptions)) return null;
    return raw;
  } catch (error) {
    console.error('[overrides] lettura Redis fallita, uso base:', error);
    return null;
  }
}

export async function saveOverrides(data: SiteData): Promise<boolean> {
  const redis = getClient();
  if (!redis) return false;
  try {
    await redis.set(KEY, { showcase: data.showcase, exceptions: data.exceptions });
    return true;
  } catch (error) {
    console.error('[overrides] scrittura Redis fallita:', error);
    return false;
  }
}
