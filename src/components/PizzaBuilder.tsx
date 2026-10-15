"use client";
import { useState } from "react";
import { useDemo, useDemoConfig } from "./demo/DemoProvider";
import { useCart } from "./cart";
import {
  doughs,
  sizes,
  toppings,
  pizzaEntry,
  type PizzaOptions,
} from "@/lib/pizza-builder";
import { formatPrice } from "@/lib/format";
export default function PizzaBuilder() {
  const data = useDemoConfig();
  const { settings } = useDemo();
  const { add } = useCart();
  const [base, setBase] = useState(data.showcase[0]?.id ?? "");
  const [options, setOptions] = useState<PizzaOptions>({
    dough: "classic",
    size: "regular",
    extras: [],
  });
  const item =
    data.showcase.find((item) => item.id === base) ?? data.showcase[0];
  if (!item) return null;
  const entry = pizzaEntry(item, options);
  return (
    <section id="componi" className="pizza-builder">
      <div>
        <p className="venue-kicker">Il banco delle possibilità</p>
        <h2>Come la vuoi stasera?</h2>
        <p>
          Parti da una pizza della carta. Cambia impasto, formato e aggiunte:
          ogni combinazione resta distinta nel carrello.
        </p>
        <label className="venue-field">
          La pizza di partenza
          <select value={item.id} onChange={(e) => setBase(e.target.value)}>
            {data.showcase.map((pizza) => (
              <option key={pizza.id} value={pizza.id}>
                {pizza.title} · {formatPrice(pizza.price)}
                {pizza.available ? "" : " · Esaurita"}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="venue-choice">
          <legend>Impasto</legend>
          {Object.entries(doughs).map(([key, value]) => (
            <label key={key}>
              <input
                type="radio"
                name="dough"
                checked={options.dough === key}
                onChange={() =>
                  setOptions({
                    ...options,
                    dough: key as PizzaOptions["dough"],
                  })
                }
              />
              {value.label}{" "}
              {value.price ? `+${formatPrice(value.price)}` : "incluso"}
            </label>
          ))}
        </fieldset>
        <fieldset className="venue-choice">
          <legend>Formato</legend>
          {Object.entries(sizes).map(([key, value]) => (
            <label key={key}>
              <input
                type="radio"
                name="size"
                checked={options.size === key}
                onChange={() =>
                  setOptions({ ...options, size: key as PizzaOptions["size"] })
                }
              />
              {value.label}{" "}
              {value.price ? `+${formatPrice(value.price)}` : "incluso"}
            </label>
          ))}
        </fieldset>
        <fieldset className="venue-choice extras">
          <legend>Un’aggiunta?</legend>
          {Object.entries(toppings).map(([key, value]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={options.extras.includes(key as keyof typeof toppings)}
                onChange={(e) => {
                  const id = key as keyof typeof toppings;
                  setOptions({
                    ...options,
                    extras: e.target.checked
                      ? [...options.extras, id]
                      : options.extras.filter((extra) => extra !== id),
                  });
                }}
              />
              {value.label} +{formatPrice(value.price)}
            </label>
          ))}
        </fieldset>
      </div>
      <div className="pizza-ticket">
        <p>Il tuo giro di prova</p>
        <h3>{item.title}</h3>
        <p>{item.ingredients?.join(", ")}</p>
        <dl>
          <div>
            <dt>Impasto</dt>
            <dd>{doughs[options.dough].label}</dd>
          </div>
          <div>
            <dt>Formato</dt>
            <dd>{sizes[options.size].label}</dd>
          </div>
          <div>
            <dt>Extra</dt>
            <dd>
              {options.extras.map((key) => toppings[key].label).join(", ") ||
                "Nessuno"}
            </dd>
          </div>
        </dl>
        <p className="pizza-ticket-price" aria-live="polite">
          {formatPrice(entry.price)}
        </p>
        <p className="venue-demo-note">
          Allergeni dichiarati: {entry.allergens.join(", ")}. Entrambi gli
          impasti contengono glutine. Per allergie o celiachia serve una
          verifica con il locale reale.
        </p>
        <button
          className="venue-button"
          disabled={!entry.available || settings.closed}
          onClick={() => add(entry)}
        >
          {settings.closed
            ? "Chiusura simulata"
            : entry.available
              ? "Aggiungi questa pizza alla prova"
              : "Pizza esaurita"}
        </button>
        <p className="venue-demo-note">
          Il carrello prepara soltanto un riepilogo, senza inviarlo.
        </p>
      </div>
    </section>
  );
}
