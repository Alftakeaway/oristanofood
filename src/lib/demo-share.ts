import { readSettings, type DemoSettings } from "./demo-settings";

// Keep shared links small and exclude uploaded images and unrelated URL data.
export const MAX_DEMO_LINK = 12000;
export function sharedSettings(search: string): DemoSettings | null {
  const raw = new URLSearchParams(search).get("demo");
  if (!raw || raw.length > MAX_DEMO_LINK) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || value.v !== 1 || typeof value.settings !== "object")
      return null;
    return readSettings(JSON.stringify({ ...value.settings, logo: "" }));
  } catch {
    return null;
  }
}
export function demoLink(location: string, settings: DemoSettings): string {
  const url = new URL(location);
  url.search = "";
  url.hash = "";
  const safe = readSettings(JSON.stringify({ ...settings, logo: "" }));
  const raw = JSON.stringify({ v: 1, settings: safe });
  if (raw.length > MAX_DEMO_LINK)
    throw new Error(
      "Troppe modifiche per un link. Ripristina alcuni prezzi e riprova.",
    );
  url.searchParams.set("demo", raw);
  if (url.href.length > MAX_DEMO_LINK)
    throw new Error(
      "Il link è troppo lungo. Ripristina alcuni prezzi e riprova.",
    );
  return url.href;
}
