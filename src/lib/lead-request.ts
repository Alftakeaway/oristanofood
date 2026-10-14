import type { DemoSettings } from "./demo-settings";
import { demoLink } from "./demo-share";

export const COMMERCIAL_EMAIL = "alfredoforte.web@gmail.com";
export function leadRequest(input: {
  method: "email" | "whatsapp";
  contact: string;
  name: string;
  location: string;
  settings: DemoSettings;
}) {
  const contact = input.contact.trim();
  if (contact.length > 120 || /[\r\n]/.test(contact))
    throw new Error("Controlla il recapito: deve essere su una sola riga.");
  if (input.method === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))
    throw new Error("Inserisci un indirizzo email valido.");
  if (
    input.method === "whatsapp" &&
    (!/^\+?[\d ()-]+$/.test(contact) ||
      contact.replace(/\D/g, "").length < 7 ||
      contact.replace(/\D/g, "").length > 15)
  )
    throw new Error(
      "Inserisci un numero WhatsApp valido, con prefisso internazionale.",
    );
  let preview = "";
  try {
    preview = `\n\nLa mia anteprima, senza logo: ${demoLink(input.location, input.settings)}`;
  } catch {
    /* A large menu must not prevent a contact request. */
  }
  const body = `Ciao Alfredo, ho provato la demo e vorrei parlare di un sito per ${input.name.trim().slice(0, 70)}.\n\nPreferisco essere ricontattato via ${input.method === "email" ? "email" : "WhatsApp"}: ${contact}.${preview}`;
  return {
    body,
    href: `mailto:${COMMERCIAL_EMAIL}?subject=${encodeURIComponent("Informazioni per il sito del mio locale")}&body=${encodeURIComponent(body)}`,
  };
}
