import { expect, test } from "vitest";
import assert from "node:assert/strict";
import raw from "../config/site-data.json";
import type { SiteData } from "./site-data";
import { applyDemo } from "./demo-adapter";
import { emptySettings, readSettings } from "./demo-settings";
import { getTodayDateString } from "./open-status";
test("demo changes are isolated, reversible and reject untrusted settings", () => {
  const base = raw as SiteData;

  const invalid = readSettings("{broken");
  assert.deepEqual(invalid, emptySettings());
  const hostile = readSettings(
    JSON.stringify({
      preset: "invalid",
      color: "red; background:url(x)",
      logo: "data:image/svg+xml,<svg/>",
      items: {
        x: { price: -2 },
        y: { price: Infinity },
        z: { available: "yes" },
      },
    }),
  );
  assert.equal(hostile.preset, "original");
  assert.equal(hostile.color, "");
  assert.equal(hostile.logo, "");
  assert.equal(hostile.items.x.price, undefined);
  assert.equal(hostile.items.z.available, undefined);
  const settings = emptySettings();
  settings.name = "Il mio locale";
  settings.items[base.showcase[0].id] = { price: 13.5, available: false };
  const before = JSON.stringify(base);
  const mine = applyDemo(base, settings);
  assert.equal(mine.businessInfo.name, "Il mio locale");
  assert.equal(mine.showcase[0].price, 13.5);
  assert.equal(mine.showcase[0].available, false);
  assert.equal(JSON.stringify(base), before);
  const other = applyDemo(base, emptySettings());
  assert.equal(other.showcase[0].price, base.showcase[0].price);
  for (const preset of ["restaurant", "pizzeria", "bakery"] as const) {
    const example = applyDemo(base, { ...emptySettings(), preset });
    assert.equal(example.businessInfo.type, preset);
    assert.equal(example.showcase.length, 4);
    assert.equal(new Set(example.showcase.map((item) => item.id)).size, 4);
    assert.equal(JSON.stringify(base), before);
  }
  const restored = applyDemo(base, emptySettings());
  assert.equal(restored.businessInfo.name, base.businessInfo.name);

  const closed = applyDemo(base, { ...emptySettings(), closed: true });
  expect(
    closed.exceptions.find(
      (item) => item.date === getTodayDateString(base.businessInfo.timezone),
    )?.isOpen,
  ).toBe(false);
  expect(base.exceptions).toEqual(raw.exceptions);
});
