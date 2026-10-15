import { expect, test } from "vitest";
import raw from "../config/site-data.json";
import { pizzaEntry } from "./pizza-builder";
test("varianti pizza: prezzo esatto, aggiunte uniche e identità distinta", () => {
  const pizza = raw.showcase[0];
  const classic = pizzaEntry(pizza, {
    dough: "classic",
    size: "regular",
    extras: [],
  });
  const full = pizzaEntry(pizza, {
    dough: "whole",
    size: "large",
    extras: ["mozzarella", "olives", "olives"],
  });
  expect(full.price).toBeCloseTo(pizza.price + 1.5 + 3 + 2 + 1.5);
  expect(full.baseId).toBe(pizza.id);
  expect(full.id).not.toBe(classic.id);
  expect(full.id).toBe(
    pizzaEntry(pizza, {
      dough: "whole",
      size: "large",
      extras: ["olives", "mozzarella"],
    }).id,
  );
  expect(full.allergens).toContain("latte");
  expect(full.allergens).toContain("glutine");
  expect(
    pizzaEntry(
      { ...pizza, price: 9.35, available: false },
      { dough: "whole", size: "large", extras: [] },
    ).price,
  ).toBe(13.85);
  expect(
    pizzaEntry(
      { ...pizza, available: false },
      { dough: "classic", size: "regular", extras: [] },
    ).available,
  ).toBe(false);
});
