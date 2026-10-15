import type { SiteData } from "@/lib/site-data";
export default function Hero({ data }: { data: SiteData }) {
  return (
    <section id="inizio" data-demo-hero className="venue-hero pizza-hero">
      <div className="venue-hero-copy">
        <p className="venue-kicker">Demo pizzeria · Oristano</p>
        <h1>{data.businessInfo.name}</h1>
        <p className="venue-hero-subtitle">La tua serata. La tua pizza.</p>
        <p>{data.businessInfo.description}</p>
        <div className="venue-actions">
          <a className="venue-button" href="#componi">
            Crea la tua pizza
          </a>
          <a href="#pizza">Sfoglia le pizze</a>
        </div>
        <p className="venue-demo-note">
          Puoi provare tutto. Nessun ordine o pagamento reale.
        </p>
      </div>
      <div className="pizza-hero-art">
        <svg
          role="img"
          aria-label="Illustrazione di una pizza margherita"
          viewBox="0 0 500 500"
        >
          <circle cx="250" cy="250" r="242" fill="#194C52" />
          <circle cx="250" cy="250" r="213" fill="#E9B949" />
          <circle cx="250" cy="250" r="187" fill="#AD3024" />
          <g fill="#FFF9EC">
            <ellipse
              cx="185"
              cy="137"
              rx="45"
              ry="33"
              transform="rotate(-20 185 137)"
            />
            <ellipse cx="337" cy="181" rx="40" ry="46" />
            <ellipse cx="296" cy="322" rx="45" ry="40" />
            <ellipse cx="156" cy="302" rx="44" ry="31" />
            <ellipse cx="243" cy="229" rx="35" ry="39" />
          </g>
          <g fill="#2B6045">
            <path d="M236 104q60 10 30 64q-51-5-30-64" />
            <path d="M345 293q54 27 6 66q-48-24-6-66" />
            <path d="M108 198q61-4 44 54q-55 8-44-54" />
            <path d="M203 350q54-17 54 42q-52 23-54-42" />
          </g>
          <g fill="#77502E">
            <circle cx="174" cy="62" r="5" />
            <circle cx="367" cy="95" r="6" />
            <circle cx="70" cy="237" r="5" />
            <circle cx="103" cy="368" r="6" />
            <circle cx="381" cy="382" r="5" />
            <circle cx="433" cy="257" r="7" />
            <circle cx="236" cy="447" r="5" />
          </g>
        </svg>
        <div className="pizza-art-caption">
          Il giro giusto
          <br />
          <strong>lo scegli tu.</strong>
        </div>
      </div>
    </section>
  );
}
