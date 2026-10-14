import { DEMO_MODE } from "./demo-mode";
import fs from 'node:fs';
import path from 'node:path';
import { unstable_cache } from 'next/cache';
import fallbackData from '@/config/site-data.json';
import type { DayHours, DayKey, HourException } from './open-status';

export type BusinessType = 'restaurant' | 'pizzeria' | 'bakery';

export interface BusinessAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  type: BusinessType;
  cuisine?: string[];
  logo: string;
  description: string;
  address: BusinessAddress;
  geo: GeoPoint;
  phone: string;
  whatsapp: string;
  priceRange?: string;
  timezone: string;
}

export interface SiteColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
}

export interface SiteFonts {
  heading: string;
  body: string;
}

export interface SiteStyles {
  colors: SiteColors;
  fonts: SiteFonts;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[];
  ingredients?: string[];
  feature?: boolean;
  allergens: string[];
  glutenFree: boolean;
  vegan: boolean;
  available: boolean;
}

export interface SectionFlags {
  menu: boolean;
  pizza: boolean;
  booking: boolean;
  services: boolean;
  wine: boolean;
  allergens: boolean;
  showcase: boolean;
}

export interface MenuCourse {
  category: string;
  label?: string;
  note?: string;
}

export interface PizzaStyle {
  name: string;
  description: string;
}

export interface PizzaExtra {
  name: string;
  price: number;
}

export interface PizzaConfig {
  categories: string[];
  doughNote: string;
  styles: PizzaStyle[];
  extras?: PizzaExtra[];
  note?: string;
}

export interface ServiceItem {
  label: string;
  note?: string;
}

export interface WineEntry {
  name: string;
  producer?: string;
  glass?: number;
  bottle?: number;
}

export interface WineGroup {
  label: string;
  items: WineEntry[];
}

export interface WineConfig {
  note?: string;
  groups: WineGroup[];
}

export interface BookingConfig {
  maxParty: number;
  advanceDays?: number;
  stepMinutes?: number;
  note?: string;
  phoneFallback?: boolean;
}

export interface SiteData {
  businessInfo: BusinessInfo;
  styles: SiteStyles;
  hours: Record<DayKey, DayHours>;
  exceptions: HourException[];
  showcase: ShowcaseItem[];
  sections?: SectionFlags;
  courses?: MenuCourse[];
  pizza?: PizzaConfig;
  services?: ServiceItem[];
  wine?: WineConfig;
  booking?: BookingConfig;
}

export const DEFAULT_SECTIONS: SectionFlags = {
  menu: false,
  pizza: false,
  booking: false,
  services: false,
  wine: false,
  allergens: false,
  showcase: true,
};

export function getSections(data: SiteData): SectionFlags {
  return { ...DEFAULT_SECTIONS, ...(data.sections ?? {}) };
}

const DATA_PATH = path.join(process.cwd(), 'src', 'config', 'site-data.json');

const readSiteDataInner = async (): Promise<SiteData> => {
    // Produzione: il repo GitHub è la fonte (sempre aggiornato dai commit webhook).
    try {
      const { loadRemote } = await import('./github-store');
      const remote = DEMO_MODE ? null : await loadRemote();
      if (remote) return remote;
    } catch {
      // Token assente o API irraggiungibile: file locale (fail-open).
    }
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as unknown;
    } catch {
      raw = fallbackData as unknown;
    }
    const { parseSiteData } = await import('./site-schema');
    // Dato rotto = build fallita con messaggio leggibile, non crash a runtime.
    return parseSiteData(raw, 'site-data.json') as SiteData;
};

// La Data Cache di Next persiste in .next/cache tra le build: con chiave
// statica riuserebbe il JSON vecchio. La versione segue il file (mtime+size),
// così ogni modifica invalida la cache; gli override remoti invalidano via tag.
function dataVersion(): string {
  try {
    const st = fs.statSync(DATA_PATH);
    return `${st.mtimeMs}-${st.size}`;
  } catch {
    return 'nofile';
  }
}

export async function getSiteData(): Promise<SiteData> {
  const cached = unstable_cache(readSiteDataInner, ['site-data-read', dataVersion()], {
    tags: ['site-data'],
  });
  return cached();
}

export { formatAddress, getPhoneHref, getDirectionsUrl, getMapsEmbedUrl } from "./site-utils";
export { formatPrice, getWhatsAppHref } from "./format";
