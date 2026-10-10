import { z } from 'zod';

// Schema di validazione per site-data.json: errori in italiano e con percorso,
// così un JSON rotto fallisce la build con un messaggio leggibile invece di
// un crash oscuro a runtime ("undefined is not an object").

const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'orario HH:MM valido (es. 12:30)');

const timeSlot = z.object({
  open: time,
  close: time,
});

const dayHours = z.object({
  isOpen: z.boolean(),
  slots: z.array(timeSlot),
});

const dayKey = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

const hourException = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data YYYY-MM-DD'),
  isOpen: z.boolean(),
  slots: z.array(timeSlot).optional(),
  note: z.string().optional(),
});

const showcaseItem = z.object({
  id: z.string().min(1, 'id mancante'),
  title: z.string().min(1, 'titolo mancante'),
  description: z.string(),
  price: z.number().min(0, 'prezzo negativo'),
  category: z.string().min(1, 'categoria mancante'),
  imageUrl: z.string().min(1, 'imageUrl mancante'),
  images: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  feature: z.boolean().optional(),
  allergens: z.array(z.string()),
  glutenFree: z.boolean(),
  vegan: z.boolean(),
  available: z.boolean(),
});

export const SiteDataSchema = z.object({
  businessInfo: z.object({
    name: z.string().min(1, 'nome attività mancante'),
    tagline: z.string(),
    type: z.enum(['restaurant', 'pizzeria', 'bakery'], 'type: restaurant|pizzeria|bakery'),
    cuisine: z.array(z.string()).optional(),
    logo: z.string().min(1, 'logo mancante'),
    description: z.string(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      zip: z.string().min(1),
      country: z.string().min(1),
    }),
    geo: z.object({ lat: z.number(), lng: z.number() }),
    phone: z.string().min(1, 'telefono mancante'),
    whatsapp: z.string().min(1, 'numero WhatsApp mancante'),
    timezone: z.string().min(1, 'timezone mancante (es. Europe/Rome)'),
  }),
  styles: z.object({
    colors: z.object({
      primary: z.string().min(1),
      secondary: z.string().min(1),
      accent: z.string().min(1),
      background: z.string().min(1),
      surface: z.string().min(1),
      foreground: z.string().min(1),
      muted: z.string().min(1),
    }),
    fonts: z.object({ heading: z.string().min(1), body: z.string().min(1) }),
  }),
  hours: z.record(dayKey, dayHours),
  exceptions: z.array(hourException),
  showcase: z.array(showcaseItem),
  sections: z
    .object({
      menu: z.boolean(),
      pizza: z.boolean(),
      booking: z.boolean(),
      services: z.boolean(),
      wine: z.boolean(),
      allergens: z.boolean(),
      showcase: z.boolean(),
    })
    .optional(),
  courses: z
    .array(z.object({ category: z.string().min(1), label: z.string().optional(), note: z.string().optional() }))
    .optional(),
  pizza: z
    .object({
      categories: z.array(z.string()),
      doughNote: z.string(),
      styles: z.array(z.object({ name: z.string().min(1), description: z.string() })),
      extras: z.array(z.object({ name: z.string().min(1), price: z.number().min(0) })).optional(),
      note: z.string().optional(),
    })
    .optional(),
  services: z.array(z.object({ label: z.string().min(1), note: z.string().optional() })).optional(),
  wine: z
    .object({
      note: z.string().optional(),
      groups: z.array(
        z.object({
          label: z.string().min(1),
          items: z.array(
            z.object({
              name: z.string().min(1),
              producer: z.string().optional(),
              glass: z.number().min(0).optional(),
              bottle: z.number().min(0).optional(),
            }),
          ),
        }),
      ),
    })
    .optional(),
  booking: z
    .object({
      maxParty: z.number().int().positive('maxParty deve essere > 0'),
      advanceDays: z.number().int().positive().optional(),
      stepMinutes: z.number().int().positive().optional(),
      note: z.string().optional(),
      phoneFallback: z.boolean().optional(),
    })
    .optional(),
});

export type SiteDataInput = z.input<typeof SiteDataSchema>;

/** Lancia Error con messaggio italiano e percorsi; usare dove un dato rotto deve bloccare. */
export function parseSiteData(data: unknown, source: string): SiteDataInput {
  const result = SiteDataSchema.safeParse(data);
  if (result.success) return result.data;
  const details = result.error.issues
    .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('; ');
  throw new Error(`${source} non valido: ${details}`);
}

/** Versione fail-open per dati remoti: null + log invece di eccezione. */
export function safeSiteData(data: unknown, source: string): SiteDataInput | null {
  const result = SiteDataSchema.safeParse(data);
  if (result.success) return result.data;
  console.error(
    `[site-schema] ${source} non valido, ignorato:`,
    result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
  );
  return null;
}
