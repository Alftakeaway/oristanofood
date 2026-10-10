import fs from 'node:fs';
import path from 'node:path';
import {
  getSiteData,
  type ShowcaseItem,
  type SiteData,
} from './site-data';
import { isRedisConfigured, saveOverrides } from './overrides-store';
import type { HourException } from './open-status';

const DATA_PATH = path.join(process.cwd(), 'src', 'config', 'site-data.json');

// Base versionata in git (sola lettura in produzione).
async function readBase(): Promise<SiteData> {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as SiteData;
  } catch {
    return getSiteData();
  }
}

// Dato effettivo = base + override (stessa fusione applicata alle letture).
export async function loadData(): Promise<SiteData> {
  return getSiteData();
}

function singleMatch(showcase: ShowcaseItem[], needle: string): ShowcaseItem {
  const query = needle.toLowerCase();
  const matches = showcase.filter((item) => item.title.toLowerCase().includes(query));
  if (matches.length === 0) {
    throw new Error(`Prodotto non trovato: "${needle}"`);
  }
  if (matches.length > 1) {
    throw new Error(`Nome ambiguo (${matches.length} corrispondenze): "${needle}"`);
  }
  return matches[0];
}

export async function upsertShowcaseItem(input: {
  title: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl: string;
  images?: string[];
  ingredients?: string[];
  feature?: boolean;
  id?: string;
  allergens?: string[];
  glutenFree?: boolean;
  vegan?: boolean;
  available?: boolean;
}): Promise<{ data: SiteData; item: ShowcaseItem }> {
  const data = structuredClone(await loadData());
  const id = input.id ?? slugify(input.title);
  const index = data.showcase.findIndex(
    (s) => s.id === id || s.title.toLowerCase() === input.title.toLowerCase(),
  );
  const existing = index >= 0 ? data.showcase[index] : undefined;
  const item: ShowcaseItem = {
    id: existing?.id ?? id,
    title: input.title,
    description: input.description ?? existing?.description ?? '',
    price: input.price ?? existing?.price ?? 0,
    category: input.category ?? existing?.category ?? 'Novità',
    imageUrl: input.imageUrl,
    ...(input.images ? { images: input.images } : existing?.images ? { images: existing.images } : {}),
    ...(input.ingredients
      ? { ingredients: input.ingredients }
      : existing?.ingredients
        ? { ingredients: existing.ingredients }
        : {}),
    // undefined viene eliminato da JSON.stringify in persist()
    feature: input.feature ?? existing?.feature,
    allergens: input.allergens ?? existing?.allergens ?? [],
    glutenFree: input.glutenFree ?? existing?.glutenFree ?? false,
    vegan: input.vegan ?? existing?.vegan ?? false,
    available: input.available ?? existing?.available ?? true,
  };
  if (index >= 0) {
    data.showcase[index] = item;
  } else {
    data.showcase.push(item);
  }
  await persist(data);
  return { data, item };
}

export async function setAvailability(
  title: string,
  available: boolean,
): Promise<{ data: SiteData; item: ShowcaseItem }> {
  const data = structuredClone(await loadData());
  const item = singleMatch(data.showcase, title);
  item.available = available;
  await persist(data);
  return { data, item };
}

export async function updatePrice(
  title: string,
  price: number,
): Promise<{ data: SiteData; item: ShowcaseItem }> {
  const data = structuredClone(await loadData());
  const item = singleMatch(data.showcase, title);
  item.price = price;
  await persist(data);
  return { data, item };
}

export async function setException(
  date: string,
  exception: Omit<HourException, 'date'>,
): Promise<SiteData> {
  const data = structuredClone(await loadData());
  const next: HourException = { date, ...exception };
  const index = data.exceptions.findIndex((e) => e.date === date);
  if (index >= 0) {
    data.exceptions[index] = next;
  } else {
    data.exceptions.push(next);
  }
  await persist(data);
  return data;
}

export async function removeException(date: string): Promise<SiteData> {
  const data = structuredClone(await loadData());
  data.exceptions = data.exceptions.filter((e) => e.date !== date);
  await persist(data);
  return data;
}

async function persist(data: SiteData): Promise<void> {
  // Produzione: Redis (filesystem Vercel è effimero). Sviluppo: file.
  if (isRedisConfigured()) {
    const ok = await saveOverrides(data);
    if (!ok) {
      throw new Error('Persistenza Redis fallita (vedi log [overrides])');
    }
    return;
  }
  if (process.env.VERCEL) {
    // Configurazione mancante in produzione: meglio un errore chiaro che una
    // scrittura silenziosamente persa.
    throw new Error(
      'UPSTASH_REDIS_REST_URL/TOKEN mancanti: gli aggiornamenti andrebbero persi, scrittura bloccata.',
    );
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-') +
    '-' +
    Math.random().toString(36).slice(2, 8)
  );
}
