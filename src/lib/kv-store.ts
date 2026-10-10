import fs from 'node:fs';
import path from 'node:path';
import {
  getSiteData,
  type ShowcaseItem,
  type SiteData,
} from './site-data';
import type { HourException } from './open-status';

const DATA_PATH = path.join(process.cwd(), 'src', 'config', 'site-data.json');

async function readFresh(): Promise<SiteData> {
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as SiteData;
  } catch {
    return getSiteData();
  }
}

export async function loadData(): Promise<SiteData> {
  return readFresh();
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
  persist(data);
  return { data, item };
}

export async function setAvailability(
  title: string,
  available: boolean,
): Promise<{ data: SiteData; item: ShowcaseItem }> {
  const data = structuredClone(await loadData());
  const item = singleMatch(data.showcase, title);
  item.available = available;
  persist(data);
  return { data, item };
}

export async function updatePrice(
  title: string,
  price: number,
): Promise<{ data: SiteData; item: ShowcaseItem }> {
  const data = structuredClone(await loadData());
  const item = singleMatch(data.showcase, title);
  item.price = price;
  persist(data);
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
  persist(data);
  return data;
}

export async function removeException(date: string): Promise<SiteData> {
  const data = structuredClone(await loadData());
  data.exceptions = data.exceptions.filter((e) => e.date !== date);
  persist(data);
  return data;
}

function persist(data: SiteData): void {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  } catch (error) {
    console.warn('[kv-store] filesystem di sola lettura, persistenza sul file saltata:', error);
  }
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
