'use client';

import type { ShowcaseItem } from '@/lib/site-data';
import ProductGallery from '@/components/ProductGallery';
import { AddToCartButton } from '@/components/cart';
import { DietFilterBar, matchesDiet, useDietFilter } from '@/components/diet-filter';

interface CategoryGroup {
  category: string;
  items: ShowcaseItem[];
}

export default function ShowcaseGrid({
  items,
  heading = 'Le specialità',
  id = 'showcase',
}: {
  items: ShowcaseItem[];
  heading?: string;
  id?: string;
}) {
  const { diet } = useDietFilter();

  if (items.length === 0) return null;

  const filtered = items.filter((item) => matchesDiet(item, diet));

  const groups: CategoryGroup[] = [];
  for (const item of filtered) {
    const existing = groups.find((group) => group.category === item.category);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.push({ category: item.category, items: [item] });
    }
  }

  return (
    <section id={id} className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-heading text-3xl font-medium md:text-4xl">{heading}</h2>
          <DietFilterBar />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-muted">Nessun prodotto corrisponde al filtro selezionato.</p>
        ) : (
          groups.map((group, index) => (
            <div key={group.category} className={index === 0 ? 'mt-8' : 'mt-16'}>
              <h3 className="font-heading text-3xl font-medium md:text-4xl">{group.category}</h3>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <article
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-foreground/5 bg-surface shadow-sm transition hover:shadow-md"
                  >
                    <ProductGallery
                      title={item.title}
                      imageUrl={item.imageUrl}
                      images={item.images}
                      price={item.price}
                      available={item.available}
                    />
                    <div className={item.available ? 'p-5' : 'p-5 opacity-70'}>
                      <h3 className="font-heading text-xl">{item.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                        {item.description}
                      </p>
                      {(item.glutenFree || item.vegan) && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.glutenFree && (
                            <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                              Senza glutine
                            </span>
                          )}
                          {item.vegan && (
                            <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                              Vegano
                            </span>
                          )}
                        </div>
                      )}
                      {item.allergens.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Allergeni">
                          {item.allergens.map((allergen) => (
                            <li
                              key={allergen}
                              className="rounded-full bg-background px-2.5 py-0.5 text-xs text-muted"
                            >
                              {allergen}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4">
                        <AddToCartButton
                          item={{
                            id: item.id,
                            title: item.title,
                            price: item.price,
                            imageUrl: item.imageUrl,
                            available: item.available,
                          }}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
