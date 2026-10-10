'use client';

import type { PizzaConfig, ShowcaseItem } from '@/lib/site-data';
import { formatPrice } from '@/lib/format';
import { AddToCartButton } from '@/components/cart';
import { DietFilterBar, matchesDiet, useDietFilter } from '@/components/diet-filter';

interface PizzaSectionProps {
  items: ShowcaseItem[];
  config: PizzaConfig;
}

export default function PizzaSection({ items, config }: PizzaSectionProps) {
  const { diet } = useDietFilter();

  const pizzas = items.filter((item) => config.categories.includes(item.category));
  if (pizzas.length === 0) return null;

  const groups = config.categories
    .map((category) => ({
      category,
      rows: pizzas.filter((item) => item.category === category && matchesDiet(item, diet)),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <section id="pizza" className="border-y border-foreground/5 bg-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-heading text-3xl font-medium md:text-4xl">La pizza</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{config.doughNote}</p>
          </div>
          <DietFilterBar />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {config.styles.map((style) => (
            <div
              key={style.name}
              className="rounded-xl border border-foreground/10 bg-surface p-4"
            >
              <h3 className="font-heading text-lg font-medium">{style.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{style.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-x-14 gap-y-12 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="font-heading text-2xl text-primary">{group.category}</h3>
              <ul className="mt-4 space-y-6">
                {group.rows.map((item) => (
                  <li key={item.id}>
                    <div className="flex items-baseline gap-3">
                      <span
                        className={
                          item.available
                            ? 'font-medium'
                            : 'font-medium text-muted line-through decoration-foreground/30'
                        }
                      >
                        {item.title}
                      </span>
                      {item.glutenFree && (
                        <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                          SG
                        </span>
                      )}
                      {item.vegan && (
                        <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
                          VG
                        </span>
                      )}
                      <span
                        aria-hidden="true"
                        className="min-w-8 flex-1 border-b border-dotted border-foreground/25"
                      />
                      <span className="shrink-0 font-heading font-semibold">
                        {formatPrice(item.price)}
                      </span>
                      <AddToCartButton
                        variant="row"
                        item={{
                          id: item.id,
                          title: item.title,
                          price: item.price,
                          imageUrl: item.imageUrl,
                          available: item.available,
                        }}
                      />
                    </div>
                    {(item.ingredients?.length ?? 0) > 0 && (
                      <p className="mt-1 text-sm text-muted">
                        {item.ingredients?.join(', ')}
                      </p>
                    )}
                    {item.description && (
                      <p className="mt-1 text-xs italic leading-relaxed text-muted">
                        {item.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {(config.extras?.length ?? 0) > 0 && (
          <div className="mt-12 rounded-2xl border border-foreground/10 bg-surface p-6">
            <h3 className="font-heading text-xl">Extra e varianti</h3>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
              {config.extras?.map((extra) => (
                <li key={extra.name} className="flex items-baseline gap-3">
                  <span>{extra.name}</span>
                  <span aria-hidden="true" className="flex-1 border-b border-dotted border-foreground/25" />
                  <span className="font-medium">{formatPrice(extra.price)}</span>
                </li>
              ))}
            </ul>
            {config.note && <p className="mt-4 text-xs text-muted">{config.note}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
