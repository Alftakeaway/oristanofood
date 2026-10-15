import type { ShowcaseItem } from "./site-data";
export const doughs = {
  classic: { label: "Classico", price: 0 },
  whole: { label: "Integrale", price: 1.5 },
};
export const sizes = {
  regular: { label: "32 cm", price: 0 },
  large: { label: "40 cm", price: 3 },
};
export const toppings = {
  mozzarella: { label: "Mozzarella", price: 2, allergens: ["latte"] },
  olives: { label: "Olive", price: 1.5, allergens: [] },
  onion: { label: "Cipolla", price: 1, allergens: [] },
};
export type PizzaOptions = {
  dough: keyof typeof doughs;
  size: keyof typeof sizes;
  extras: (keyof typeof toppings)[];
};
export function pizzaEntry(item: ShowcaseItem, options: PizzaOptions) {
  const extras = [...new Set(options.extras)].sort();
  const surchargeCents =
    Math.round(doughs[options.dough].price * 100) +
    Math.round(sizes[options.size].price * 100) +
    extras.reduce((sum, key) => sum + Math.round(toppings[key].price * 100), 0);
  const variantLabel = [
    doughs[options.dough].label,
    sizes[options.size].label,
    ...extras.map((key) => `extra ${toppings[key].label}`),
  ].join(", ");
  return {
    id: `${item.id}:${options.dough}:${options.size}:${extras.join("+")}`,
    baseId: item.id,
    variantLabel,
    surcharge: surchargeCents / 100,
    title: `${item.title} — ${variantLabel}`,
    price: (Math.round(item.price * 100) + surchargeCents) / 100,
    imageUrl: item.imageUrl,
    available: item.available,
    allergens: [
      ...new Set([
        ...item.allergens,
        "glutine",
        ...extras.flatMap((key) => toppings[key].allergens),
      ]),
    ],
  };
}
