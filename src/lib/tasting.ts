import type { ShowcaseItem } from "./site-data";
export const tastingPaths = {
  terra: {
    label: "La terra",
    ids: ["datterini-bocconchini", "malloreddus-campidanese", "seadas-miele"],
  },
  mare: {
    label: "Il mare",
    ids: [
      "tagliere-di-mare",
      "fregola-frutti-di-mare",
      "sorbetto-limone-sinnai",
    ],
  },
};
export const pairings = {
  none: { label: "Solo il percorso", price: 0 },
  wine: { label: "Due calici in abbinamento", price: 12 },
  soft: { label: "Due bevande analcoliche", price: 6 },
};
export function tastingQuote(
  items: ShowcaseItem[],
  path: keyof typeof tastingPaths,
  pairing: keyof typeof pairings,
  guests: number,
) {
  const selected = tastingPaths[path].ids.map((id) =>
    items.find((item) => item.id === id),
  );
  const available = selected.every((item) => item?.available);
  const dishes = selected.filter((item): item is ShowcaseItem => !!item);
  const perGuestCents =
    dishes.reduce((sum, item) => sum + Math.round(item.price * 100), 0) +
    Math.round(pairings[pairing].price * 100);
  const people = Number.isFinite(guests)
    ? Math.min(12, Math.max(1, Math.floor(guests)))
    : 1;
  return {
    available,
    dishes,
    people,
    perGuest: perGuestCents / 100,
    total: (perGuestCents * people) / 100,
  };
}
