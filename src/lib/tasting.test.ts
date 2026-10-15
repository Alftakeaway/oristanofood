import { expect, test } from "vitest";
import data from "../config/site-data.json";
import { tastingQuote, tastingPaths } from "./tasting";
test("degustazione: ospiti, abbinamento e prezzo personalizzato", () => {
  const items = structuredClone(data.showcase);
  const base = tastingQuote(items, "terra", "none", 2);
  expect(base.total).toBe(base.perGuest * 2);
  expect(base.available).toBe(true);
  const dish = items.find((i) => i.id === tastingPaths.terra.ids[0])!;
  dish.price += 2.5;
  expect(tastingQuote(items, "terra", "wine", 3).total).toBeCloseTo(
    (base.perGuest + 2.5 + 12) * 3,
  );
  dish.available = false;
  expect(tastingQuote(items, "terra", "none", 2).available).toBe(false);
  expect(tastingQuote(items, "mare", "none", 2).available).toBe(true);
});
