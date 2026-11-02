"use client";
import {LocalizedContent} from "@/i18n";


import { useState } from "react";

import type { MenuCourse, ShowcaseItem } from "@/lib/site-data";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/cart";
import {
  DietFilterBar,
  matchesDiet,
  useDietFilter,
} from "@/components/diet-filter";

interface MenuSectionProps {
  items: ShowcaseItem[];
  courses: MenuCourse[];
}

export default function MenuSection({ items, courses }: MenuSectionProps) {
  const { diet } = useDietFilter();
  const [active, setActive] = useState("Tutti");

  const known: MenuCourse[] = courses.filter((course) =>
    items.some((item) => item.category === course.category),
  );
  const extraCategories: MenuCourse[] = Array.from(
    new Set(
      items
        .map((item) => item.category)
        .filter(
          (category) => !courses.some((course) => course.category === category),
        ),
    ),
  ).map((category) => ({ category }));
  const ordered = [...known, ...extraCategories];

  if (ordered.length === 0) return null;

  return <LocalizedContent>{(
    <section id="menu" className="py-20 of-menu">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div data-reveal>
            <p className="of-eyebrow">La carta / 02</p>
            <h2 className="font-heading text-3xl font-medium md:text-4xl">
              Ogni piatto, una storia.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Piatti della cucina e pizze: clicca il + per comporre il tuo
              ordine da asporto.
            </p>
          </div>
          <DietFilterBar />
        </div>

        <div
          className="of-course-nav"
          role="group"
          aria-label="Scegli la portata"
        >
          {["Tutti", ...ordered.map((course) => course.category)].map(
            (category) => (
              <button
                key={category}
                type="button"
                aria-pressed={active === category}
                onClick={() => setActive(category)}
              >
                {category}
              </button>
            ),
          )}
        </div>
        <div
          className="mt-10 grid gap-x-14 gap-y-14 md:grid-cols-2"
          aria-live="polite"
        >
          {ordered
            .filter(
              (course) => active === "Tutti" || course.category === active,
            )
            .map((course) => {
              const rows = items.filter(
                (item) =>
                  item.category === course.category && matchesDiet(item, diet),
              );
              if (rows.length === 0) return null;
              return (
                <div key={course.category} className="of-course" data-reveal>
                  <h3 className="font-heading text-2xl text-primary">
                    {course.label ?? course.category}
                  </h3>
                  {course.note && (
                    <p className="mt-1 text-xs italic text-muted">
                      {course.note}
                    </p>
                  )}
                  <ul className="mt-4 space-y-5">
                    {rows.map((item) => (
                      <li key={item.id}>
                        <div className="flex items-baseline gap-3">
                          <span
                            className={
                              item.available
                                ? "font-medium"
                                : "font-medium text-muted line-through decoration-foreground/30"
                            }
                          >
                            {item.title}
                          </span>
                          {item.glutenFree && (
                            <span
                              className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary"
                              title="Senza glutine"
                            >
                              SG
                            </span>
                          )}
                          {item.vegan && (
                            <span
                              className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary"
                              title="Vegano"
                            >
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
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {item.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  )}</LocalizedContent>;
}
