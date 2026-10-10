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

const readSiteData = unstable_cache(
  async (): Promise<SiteData> => {
    let base: SiteData;
    try {
      base = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as SiteData;
    } catch {
      base = fallbackData as unknown as SiteData;
    }
    // Override runtime (WhatsApp → Redis): se presenti, sostituiscono le liste base.
    try {
      const { loadOverrides } = await import('./overrides-store');
      const overrides = await loadOverrides();
      if (overrides) {
        return { ...base, showcase: overrides.showcase, exceptions: overrides.exceptions };
      }
    } catch {
      // Redis non configurato o irraggiungibile: vale la base (fail-open).
    }
    return base;
  },
  ['site-data-read'],
  { tags: ['site-data'] },
);

export async function getSiteData(): Promise<SiteData> {
  return readSiteData();
}

export function formatAddress(address: BusinessAddress): string {
  return `${address.street}, ${address.zip} ${address.city}, ${address.country}`;
}

export function getPhoneHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`;
}

export function getDirectionsUrl(geo: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`;
}

export function getMapsEmbedUrl(geo: GeoPoint): string {
  return `https://www.google.com/maps?q=${geo.lat},${geo.lng}&z=16&output=embed`;
}

export { formatPrice, getWhatsAppHref } from './format';
