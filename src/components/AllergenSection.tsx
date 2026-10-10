import type { ShowcaseItem } from '@/lib/site-data';
import { ALLERGEN_CATEGORIES, itemAllergenKeys } from '@/lib/allergens';

export default function AllergenSection({ items }: { items: ShowcaseItem[] }) {
  if (items.length === 0) return null;

  const rows = items.map((item) => ({ item, keys: itemAllergenKeys(item.allergens) }));
  const present = ALLERGEN_CATEGORIES.filter((category) =>
    rows.some((row) => row.keys.has(category.key)),
  );
  const absent = ALLERGEN_CATEGORIES.filter(
    (category) => !present.some((entry) => entry.key === category.key),
  );

  return (
    <section id="allergeni" className="border-t border-foreground/5 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-heading text-3xl font-medium md:text-4xl">Allergeni e diete</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Tabella generata dalla carta: spunta = allergene presente tra gli ingredienti dichiarati.
          Le 14 categorie sono quelle obbligatorie del Reg. UE 1169/2011. Segnala sempre
          un&apos;allergia o un&apos;intolleranza al personale: le preparazioni condivise possono
          contenere tracce.
        </p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-foreground/10 bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <caption className="sr-only">
              Presenza dei 14 allergeni regolamentari per ogni piatto in carta
            </caption>
            <thead>
              <tr className="border-b border-foreground/10 text-left">
                <th scope="col" className="sticky left-0 z-10 bg-surface px-4 py-3 font-semibold">
                  Piatto
                </th>
                {present.map((category) => (
                  <th
                    key={category.key}
                    scope="col"
                    className="px-2 py-3 text-center text-xs font-medium text-muted"
                    title={category.label}
                  >
                    {category.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, keys }, index) => (
                <tr
                  key={item.id}
                  className={index % 2 === 1 ? 'border-b border-foreground/5 bg-background/40' : 'border-b border-foreground/5'}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 px-4 py-3 text-left font-medium ${
                      index % 2 === 1 ? 'bg-background' : 'bg-surface'
                    }`}
                  >
                    {item.title}
                  </th>
                  {present.map((category) => (
                    <td
                      key={category.key}
                      className="px-2 py-3 text-center"
                      aria-label={
                        keys.has(category.key)
                          ? `${item.title}: contiene ${category.label}`
                          : `${item.title}: senza ${category.label}`
                      }
                    >
                      {keys.has(category.key) ? (
                        <span className="text-primary" aria-hidden="true">
                          ✓
                        </span>
                      ) : (
                        <span className="text-foreground/20" aria-hidden="true">
                          ·
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {absent.length > 0 && (
          <p className="mt-4 text-xs text-muted">
            Mai presenti in carta: {absent.map((category) => category.label.toLowerCase()).join(', ')}
            .
          </p>
        )}
      </div>
    </section>
  );
}
