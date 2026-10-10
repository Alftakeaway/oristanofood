import fs from 'node:fs';
import path from 'node:path';
import {
  getSiteData,
  type ShowcaseItem,
  type SiteData,
} from './site-data';
import { isGitHubConfigured, saveRemote } from './github-store';
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
  await persist(data, `WhatsApp: scheda "${item.title}" aggiornata`);
  return { data, item };
}

export async function setAvailability(
  title: string,
  available: boolean,
): Promise<{ data: SiteData; item: ShowcaseItem }> {
  const data = structuredClone(await loadData());
  const item = singleMatch(data.showcase, title);
  item.available = available;
  await persist(data, `WhatsApp: "${item.title}" ${available ? 'disponibile' : 'esaurito'}`);
  return { data, item };
}

export async function updatePrice(
  title: string,
  price: number,
): Promise<{ data: SiteData; item: ShowcaseItem }> {
  const data = structuredClone(await loadData());
  const item = singleMatch(data.showcase, title);
  item.price = price;
  await persist(data, `WhatsApp: prezzo "${item.title}" €${price}`);
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
  await persist(data, `WhatsApp: orari ${date} ${exception.isOpen ? 'apertura straord.' : 'chiuso'}`);
  return data;
}

export async function removeException(date: string): Promise<SiteData> {
  const data = structuredClone(await loadData());
  data.exceptions = data.exceptions.filter((e) => e.date !== date);
  await persist(data, `WhatsApp: orari ${date} ripristinati`);
  return data;
}

async function persist(data: SiteData, message: string): Promise<void> {
  // Produzione: commit nel repo (niente servizi esterni). Sviluppo: file.
  if (isGitHubConfigured()) {
    const ok = await saveRemote(data, message);
    if (!ok) {
      throw new Error('Commit GitHub fallito (vedi log [github-store])');
    }
    return;
  }
  if (process.env.VERCEL) {
    // Configurazione mancante in produzione: meglio un errore chiaro che una
    // scrittura silenziosamente persa (filesystem Vercel è effimero).
    throw new Error(
      'GITHUB_TOKEN mancante: gli aggiornamenti andrebbero persi, scrittura bloccata.',
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
