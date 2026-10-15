import { expect, test } from "vitest";
import { demoFilename, qrLink, pdfText } from "./demo-export";
import { emptySettings } from "./demo-settings";
import { sharedSettings } from "./demo-share";
test("export names cannot introduce path separators or markup", () => {
  expect(demoFilename("../Caffè <script> / Porto")).toBe("Caffe-script-Porto");
  expect(demoFilename("🥖")).toBe("il-tuo-locale");
  expect(pdfText("Caffè 🥖 €")).toBe("Caffè  €");
});
test("QR identity mode excludes menu changes and logos", () => {
  const settings = {
    ...emptySettings(),
    name: "La mia pizzeria",
    items: { pizza: { price: 9.5, available: false } },
    logo: "private",
  };
  const full = sharedSettings(
    new URL(qrLink("https://example.com", settings, true)).search,
  );
  const compact = sharedSettings(
    new URL(qrLink("https://example.com", settings, false)).search,
  );
  expect(full?.items.pizza.price).toBe(9.5);
  expect(compact?.items).toEqual({});
  expect(compact?.logo).toBe("");
  expect(compact?.name).toBe(settings.name);
});
test("large menus fail the QR with a useful alternative", () => {
  const settings = emptySettings();
  for (let i = 0; i < 100; i++)
    settings.items["product-" + i] = { price: 9, available: true };
  expect(() => qrLink("https://example.com", settings, true)).toThrow("QR");
  expect(() => qrLink("https://example.com", settings, false)).not.toThrow();
});
