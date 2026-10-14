import { expect, test } from "vitest";
import { demoLink, sharedSettings } from "./demo-share";
import { emptySettings } from "./demo-settings";

test("shared demo round trips Unicode, prices and availability without uploaded logo or unrelated URL data", () => {
  const settings = {
    ...emptySettings(),
    name: "Caffè & Pane 🥖",
    color: "#234B3D",
    logo: "data:image/png;base64,aGVsbG8=",
    items: { bread: { price: 4.5, available: false } },
  };
  const link = demoLink("https://demo.example/?token=private#menu", settings);
  expect(link).not.toContain("private");
  const restored = sharedSettings(new URL(link).search);
  expect(restored).toEqual({ ...settings, logo: "" });
  expect(settings.logo).not.toBe("");
});
test("invalid and hostile links are rejected or sanitized", () => {
  expect(sharedSettings("?demo=broken")).toBeNull();
  expect(
    sharedSettings(
      "?demo=" + encodeURIComponent(JSON.stringify({ v: 2, settings: {} })),
    ),
  ).toBeNull();
  const query = new URLSearchParams({
    demo: JSON.stringify({
      v: 1,
      settings: {
        color: "red;url(x)",
        name: "x".repeat(90),
        items: { bad: { price: -1 } },
      },
    }),
  });
  const restored = sharedSettings(query.toString());
  expect(restored?.color).toBe("");
  expect(restored?.name.length).toBe(70);
  expect(restored?.items.bad.price).toBeUndefined();
  expect(sharedSettings("?demo=" + "x".repeat(12001))).toBeNull();
});
test("oversized shared menu fails with a useful message", () => {
  const settings = emptySettings();
  for (let i = 0; i < 200; i++)
    settings.items["x".repeat(100) + i] = { price: 1 };
  expect(() => demoLink("https://demo.example", settings)).toThrow();
});
