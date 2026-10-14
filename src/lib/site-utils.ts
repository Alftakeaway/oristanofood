import { DEMO_MODE } from "./demo-mode";
import type { BusinessAddress, GeoPoint, SiteData } from "./site-data";
export function formatAddress(address: BusinessAddress): string {
  return `${address.street}, ${address.zip} ${address.city}, ${address.country}`;
}

export function getPhoneHref(phone: string): string {
  if (DEMO_MODE) return "#demo-contact";
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function getDirectionsUrl(geo: GeoPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${geo.lat},${geo.lng}`;
}

export function getMapsEmbedUrl(geo: GeoPoint): string {
  return `https://www.google.com/maps?q=${geo.lat},${geo.lng}&z=16&output=embed`;
}

export function getSections(data: SiteData) {
  return {
    menu: false,
    pizza: false,
    booking: false,
    services: false,
    wine: false,
    allergens: false,
    showcase: true,
    ...data.sections,
  };
}
