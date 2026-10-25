import Image from "next/image";

export default function Editorial() {
  return (
    <section className="of-editorial" aria-labelledby="story-title">
      <div className="of-container of-editorial__grid">
        <div className="of-editorial__image" data-reveal>
          <Image
            src="/photos/culurgiones.webp"
            alt="La chiusura a spiga di un culurgione sardo fatto a mano, prima della cottura"
            fill
            sizes="(max-width: 800px) 100vw, 45vw"
          />
          <span>La cura è nei dettagli.</span>
        </div>
        <div className="of-editorial__copy" data-reveal>
          <p className="of-eyebrow">Un’isola, tante storie</p>
          <h2 id="story-title">
            Le mani sanno.
            <br />
            <em>Il tempo fa il resto.</em>
          </h2>
          <p>
            La semola diventa pasta. Il mare suggerisce il piatto del giorno. Il
            forno dà il suo carattere all’impasto.
          </p>
          <p>
            È la nostra idea di osteria: ricette sarde, un buon calice e il
            piacere di restare ancora un po’ a tavola.
          </p>
          <a className="of-text-link" href="#menu">
            Dalla cucina al tuo piatto ↗
          </a>
          <div className="of-editorial__notes">
            <span>
              01 <b>La cucina</b>Semola, orto e mare
            </span>
            <span>
              02 <b>Il forno</b>Impasti e pazienza
            </span>
            <span>
              03 <b>La tavola</b>Il gusto di stare insieme
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Atmosphere() {
  return (
    <section className="of-atmosphere" aria-labelledby="atmosphere-title">
      <div className="of-container">
        <div className="of-section-head" data-reveal>
          <div>
            <p className="of-eyebrow">Il piacere di fermarsi</p>
            <h2 id="atmosphere-title">
              Aggiungi un posto.
              <br />
              <em>Al resto pensiamo noi.</em>
            </h2>
          </div>
          <a className="of-text-link" href="#prenota">
            Ci vediamo a tavola ↗
          </a>
        </div>
        <div className="of-atmosphere__photos">
          <figure data-reveal>
            <div>
              <Image
                src="/photos/sala.webp"
                alt="Una sala ristorante con tavoli apparecchiati, legno e luce naturale"
                fill
                sizes="(max-width: 700px) 100vw, 65vw"
              />
            </div>
            <figcaption>Il piacere di condividere.</figcaption>
          </figure>
          <figure data-reveal>
            <div>
              <Image
                src="/photos/seadas.webp"
                alt="Una seada dorata su un piatto di ceramica decorato"
                fill
                sizes="(max-width: 700px) 100vw, 30vw"
              />
            </div>
            <figcaption>Lascia spazio per il dolce.</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
