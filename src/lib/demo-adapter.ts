import type { CSSProperties } from "react";
import type { SiteData } from "./site-data";
import type { DemoSettings } from "./demo-settings";
import { samples, categoryLabels } from "./demo-catalog";
import { DAY_ORDER, getTodayDateString } from "./open-status";
export type DemoConfig = SiteData;
export const demoItems = (config: SiteData) => config.showcase;
export const demoName = (config: SiteData) => config.businessInfo.name;
export const demoColor = (config: SiteData) => config.styles.colors.primary;
export function applyDemo(base: SiteData, settings: DemoSettings): SiteData {
  const data = structuredClone(base);
  data.businessInfo.whatsapp = "#demo-contact";
  if (settings.preset !== "original") {
    const sample = samples[settings.preset];
    data.businessInfo.name = sample.name;
    data.businessInfo.type = settings.preset;
    data.businessInfo.tagline = sample.tagline;
    data.businessInfo.description = sample.description;
    data.showcase = sample.products.map((item) => ({
      ...item,
      category: categoryLabels[item.category],
      imageUrl: `/placeholders/${item.category === "pizze" ? "pizza" : ["antipasti", "primi", "secondi", "dolci"].includes(item.category) ? item.category : "dolci"}.svg`,
      feature: true,
      available: true,
      vegan: item.id === "demo-ortolana",
      glutenFree: item.id === "demo-secondo",
    }));
    data.courses = [
      ...new Set(
        sample.products
          .filter((item) => item.category !== "pizze")
          .map((item) => item.category),
      ),
    ].map((id) => ({ category: categoryLabels[id] }));
    data.pizza = {
      categories: ["Pizze"],
      doughNote: "Impasto a lunga lievitazione",
      styles: [],
    };
    data.sections = {
      menu: true,
      pizza: settings.preset === "pizzeria",
      booking: settings.preset !== "bakery",
      services: true,
      wine: false,
      allergens: true,
      showcase: true,
    };
    data.services =
      settings.preset === "bakery"
        ? [
            {
              label: "Torte su richiesta",
              note: "Messaggio dimostrativo: scegli il dolce e prova l'anteprima dell'ordine.",
            },
          ]
        : [
            {
              label: "Asporto",
              note: "Scegli i prodotti e prova l'anteprima dell'ordine.",
            },
          ];
    if (settings.preset === "bakery")
      for (const day of DAY_ORDER)
        data.hours[day] = {
          isOpen: true,
          slots: [{ open: "07:30", close: "19:00" }],
        };
    data.exceptions = [];
  }
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
