import type { SiteData } from "@/lib/site-data";
import { formatPrice } from "@/lib/format";
export default function Hero({ data }: { data: SiteData }) {
  const picks = [
    "carciofi-alla-sarda",
    "malloreddus-campidanese",
    "seadas-miele",
  ]
    .map((id) => data.showcase.find((item) => item.id === id))
    .filter((item) => item !== undefined);
  return (
    <section id="inizio" data-demo-hero className="venue-hero restaurant-hero">
      <div className="venue-hero-copy">
        <p className="venue-kicker">Una tavola immaginaria, in Sardegna</p>
        <h1>{data.businessInfo.name}</h1>
        <p className="venue-hero-subtitle">Il piacere di fermarsi a tavola.</p>
        <p>{data.businessInfo.description}</p>
        <div className="venue-actions">
          <a className="venue-button" href="#prenota">
            Prova a prenotare un tavolo
          </a>
          <a href="#menu">Esplora la carta</a>
        </div>
        <p className="venue-demo-note">
          Demo ristorante · Nessuna prenotazione viene inviata.
        </p>
      </div>
      <div className="restaurant-menu-preview">
        <span className="restaurant-mark" aria-hidden="true">
          OP
        </span>
        <p>Dal nostro quaderno di cucina</p>
        <h2>Un assaggio di Sardegna</h2>
        <ul>
          {picks.map((item) => (
            <li key={item.id}>
              <span>
                {item.title}
                <small>
                  {item.category}
                  {!item.available ? " · Esaurito" : ""}
                </small>
              </span>
              <strong>{formatPrice(item.price)}</strong>
            </li>
          ))}
        </ul>
        <p className="restaurant-menu-foot">
          La carta cambia. Il tempo a tavola resta.
          <br />
          Menu e prezzi dimostrativi
        </p>
      </div>
    </section>
  );
}
