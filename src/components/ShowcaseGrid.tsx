"use client";
import {LocalizedContent} from "@/i18n";

import type { ShowcaseItem } from "@/lib/site-data";
import ProductGallery from "./ProductGallery";
import { AddToCartButton } from "./cart";
import { DietFilterBar, matchesDiet, useDietFilter } from "./diet-filter";

export default function ShowcaseGrid({
  items,
  heading = "Il gusto di essere qui.",
  id = "showcase",
}: {
  items: ShowcaseItem[];
  heading?: string;
  id?: string;
}) {
  const { diet } = useDietFilter();
  if (!items.length) return null;
  const filtered = items.filter((item) => matchesDiet(item, diet));
  return <LocalizedContent>{(
    <section id={id} className="of-specialties">
      <div className="of-container">
        <div className="of-section-head" data-reveal>
          <div>
            <p className="of-eyebrow">Dalla nostra cucina / 01</p>
            <h2>{heading}</h2>
            <p>Un assaggio della carta, dal primo boccone al dolce.</p>
          </div>
          <DietFilterBar />
        </div>
        <div className="of-dish-grid">
          {filtered.map((item, index) => (
            <article key={item.id} className="of-dish group" data-reveal>
              <div className="of-dish__number" aria-hidden="true">
                0{index + 1}
                <span>{item.category}</span>
              </div>
              <ProductGallery
                title={item.title}
                imageUrl={item.imageUrl}
                images={item.images}
                price={item.price}
                available={item.available}
              />
              <div className="of-dish__body">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="of-dish__tags">
                  {item.glutenFree && <span>Senza glutine</span>}
                  {item.vegan && <span>Vegano</span>}
                  <span>
                    Allergeni: {item.allergens.join(", ") || "nessuno indicato"}
                  </span>
                </div>
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
            </article>
          ))}
        </div>
        {!filtered.length && (
          <p role="status" className="of-empty">
            Nessuna specialità corrisponde al filtro. Scegli “Tutti” per
            rivedere la selezione.
          </p>
        )}
        <a href="#menu" className="of-text-link of-specialties__more">
          Tutta la carta, piatto per piatto ↗
        </a>
      </div>
    </section>
  )}</LocalizedContent>;
}
