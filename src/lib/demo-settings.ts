export type DemoPreset = "original" | "restaurant" | "pizzeria" | "bakery";
export interface DemoSettings {
  preset: DemoPreset;
  name: string;
  color: string;
  logo: string;
  closed: boolean;
  items: Record<string, { price?: number; available?: boolean }>;
}
export const emptySettings = (): DemoSettings => ({
  preset: "original",
  name: "",
  color: "",
  logo: "",
  closed: false,
  items: {},
});
export function readSettings(raw: string | null): DemoSettings {
  const result = emptySettings();
  try {
    const data = JSON.parse(raw || "null");
    if (!data || typeof data !== "object") return result;
    if (["original", "restaurant", "pizzeria", "bakery"].includes(data.preset))
      result.preset = data.preset;
    if (typeof data.name === "string") result.name = data.name.slice(0, 70);
    if (["#7A2E1D", "#234B3D", "#263E62", "#633B61"].includes(data.color))
      result.color = data.color;
    if (
      typeof data.logo === "string" &&
      data.logo.length < 700000 &&
      /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data.logo)
    )
      result.logo = data.logo;
    result.closed = data.closed === true;
    if (data.items && typeof data.items === "object")
      for (const [id, patch] of Object.entries(data.items).slice(0, 200)) {
        if (
          !patch ||
          typeof patch !== "object" ||
          id === "__proto__" ||
          id === "constructor" ||
          id === "prototype"
        )
          continue;
        const value = patch as Record<string, unknown>;
        const item: { price?: number; available?: boolean } = {};
        if (
          typeof value.price === "number" &&
          Number.isFinite(value.price) &&
          value.price >= 0 &&
          value.price <= 9999
        )
          item.price = Math.round(value.price * 100) / 100;
        if (typeof value.available === "boolean")
          item.available = value.available;
        result.items[id] = item;
      }
  } catch {
    /* Invalid session data resets to the baseline. */
  }
  return result;
}
