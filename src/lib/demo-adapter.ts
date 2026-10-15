import type { CSSProperties } from "react";
import type { SiteData } from "./site-data";
import type { DemoSettings } from "./demo-settings";
import { getTodayDateString } from "./open-status";
export type DemoConfig = SiteData;
export const demoItems = (config: SiteData) => config.showcase;
export const demoName = (config: SiteData) => config.businessInfo.name;
export const demoColor = (config: SiteData) => config.styles.colors.primary;
export function applyDemo(base: SiteData, settings: DemoSettings): SiteData {
  const data = structuredClone(base);
  data.businessInfo.whatsapp = "#demo-contact";
  if (settings.name.trim()) data.businessInfo.name = settings.name.trim();
  if (settings.logo) data.businessInfo.logo = settings.logo;
  if (settings.color) data.styles.colors.primary = settings.color;
  data.showcase = data.showcase.map((item) => ({
    ...item,
    ...settings.items[item.id],
  }));
  if (settings.closed) {
    const date = getTodayDateString(data.businessInfo.timezone);
    data.exceptions = [
      ...data.exceptions.filter((item) => item.date !== date),
      { date, isOpen: false, note: "Chiusura di oggi simulata dal gestore" },
    ];
  }
  return data;
}

export const demoStyle = (config: SiteData): CSSProperties =>
  ({ "--site-primary": config.styles.colors.primary }) as CSSProperties;
