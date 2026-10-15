"use client";
import { useState } from "react";
import { useDemo, useDemoConfig } from "./demo/DemoProvider";
import { formatPrice } from "@/lib/format";
import { pairings, tastingPaths, tastingQuote } from "@/lib/tasting";
export default function TastingExperience() {
  const data = useDemoConfig();
  const { preview, settings } = useDemo();
  const [path, setPath] = useState<keyof typeof tastingPaths>("terra");
  const [pairing, setPairing] = useState<keyof typeof pairings>("none");
  const [guests, setGuests] = useState(2);
  const q = tastingQuote(data.showcase, path, pairing, guests);
  return (
    <section id="degustazione" className="tasting-section">
      <div>
        <p className="venue-kicker">Una cena da immaginare</p>
        <h2>Tre portate, il tuo percorso.</h2>
        <p>
          Scegli la terra o il mare, aggiungi un abbinamento e scopri il conto
          per i tuoi ospiti. Il totale segue i prezzi che provi nella carta.
        </p>
        <fieldset className="venue-choice">
          <legend>Il percorso</legend>
          {Object.entries(tastingPaths).map(([id, value]) => (
            <label key={id}>
              <input
                type="radio"
                name="tasting-path"
                value={id}
                checked={path === id}
                onChange={() => setPath(id as keyof typeof tastingPaths)}
              />
              {value.label}
            </label>
          ))}
        </fieldset>
        <label className="venue-field">
          Abbinamento
          <select
            value={pairing}
            onChange={(e) =>
              setPairing(e.target.value as keyof typeof pairings)
            }
          >
            {Object.entries(pairings).map(([id, value]) => (
              <option key={id} value={id}>
                {value.label}
                {value.price ? ` · +${formatPrice(value.price)} a persona` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="venue-field">
          Ospiti
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tasting-summary">
        <h3>{tastingPaths[path].label}</h3>
        <ol>
          {q.dishes.map((item) => (
            <li key={item.id}>
              {item.title}
              <small>{item.available ? item.category : "Esaurito"}</small>
            </li>
          ))}
        </ol>
        <p>{pairings[pairing].label}</p>
        <p className="tasting-price">
          {formatPrice(q.perGuest)} <small>a persona</small>
        </p>
        <p aria-live="polite">
          {q.people} ospiti · Totale dimostrativo{" "}
          <strong>{formatPrice(q.total)}</strong>
        </p>
        {!q.available && (
          <p role="status">
            Un piatto non è disponibile. Prova l’altro percorso o ripristina il
            menu.
          </p>
        )}
        <button
          className="venue-button"
          disabled={!q.available || settings.closed}
          onClick={() =>
            preview(`Richiesta degustazione DEMO per ${data.businessInfo.name}
${tastingPaths[path].label}: ${q.dishes.map((item) => item.title).join(", ")}
${q.people} ospiti · ${pairings[pairing].label}
Totale indicativo ${formatPrice(q.total)}
Data e tavolo da concordare. Nessuna prenotazione inviata.`)
          }
        >
          Prova la richiesta degustazione
        </button>
        <p className="venue-demo-note">
          Allergeni dei piatti nella carta. Abbinamenti e disponibilità sono
          esempi, da verificare nel sito reale.
        </p>
      </div>
    </section>
  );
}
