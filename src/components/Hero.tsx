import Image from "next/image";
import type { SiteData } from "@/lib/site-data";
import { getSections } from "@/lib/site-utils";

export default function Hero({ data }: { data: SiteData }) {
  const original = data.businessInfo.name === "Osteria Fenicio";
  const sections = getSections(data);
  const photo =
    data.businessInfo.type === "bakery"
      ? {
          src: "/photos/demo/cornetto.webp",
          alt: "Cornetto sfogliato ripieno di crema pasticcera",
          caption: "Il piacere di una colazione",
        }
      : !original && data.businessInfo.type === "pizzeria"
        ? {
            src: "/photos/pizza.webp",
            alt: "Pizza Margherita con pomodoro, mozzarella e basilico",
            caption: "Una pizza, tutto il suo carattere",
          }
        : {
            src: "/photos/fregola.webp",
            alt: "Fregola sarda ai frutti di mare, con cozze, vongole e crostacei",
            caption: "Fregola ai frutti di mare",
          };
  return (
    <section data-demo-hero className="of-hero" aria-labelledby="hero-title">
      <div className="of-hero__copy">
        <p className="of-eyebrow of-enter">
          {data.businessInfo.address.city} · {data.businessInfo.tagline}
        </p>
        <h1 id="hero-title" className="of-hero__title of-enter">
          {original ? (
            <>
              <span>Osteria</span>
              <span className="of-hero__name">
                Fenicio
                <span className="of-star" aria-hidden="true">
                  ✳
                </span>
              </span>
            </>
          ) : (
            data.businessInfo.name
          )}
        </h1>
        <p className="of-hero__line of-enter">
          {original ? (
            <>
              La Sardegna,
              <br /> <em>a tavola.</em>
            </>
          ) : (
            data.businessInfo.tagline
          )}
        </p>
        <p className="of-hero__description of-enter">
          {original
            ? "Il mare, la semola, il calore del forno. Una cucina che parte da qui e si prende il suo tempo."
            : data.businessInfo.description}
        </p>
        <div className="of-hero__actions of-enter">
          <a href={sections.menu ? "#menu" : "#info"} className="of-button">
            {sections.menu ? "Esplora il menù" : "Scopri il locale"}{" "}
            <span aria-hidden="true">↗</span>
          </a>
          <a
            href={sections.booking ? "#prenota" : "#info"}
            className="of-text-link"
          >
            {sections.booking ? "Un tavolo per te" : "Orari e contatti"}{" "}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <a
          href={sections.showcase ? "#showcase" : "#info"}
          className="of-scroll-link"
        >
          Scorri, c’è molto di buono <span aria-hidden="true">↓</span>
        </a>
      </div>
      <div className="of-hero__visual" data-parallax>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="(max-width: 800px) 100vw, 53vw"
          className="of-hero__photo"
        />
        <div className="of-hero__photo-shade" />
        <div className="of-hero__stamp" aria-hidden="true">
          <span>terra · mare · forno ·</span>
          <b>{data.businessInfo.name.replace(/^Osteria\s+/i, "").charAt(0)}</b>
        </div>
        <div className="of-hero__caption">
          <span>01 / La cucina</span>
          <strong>Il sapore delle cose fatte bene.</strong>
          <span>{photo.caption}</span>
        </div>
      </div>
      <div className="of-hero__foot">
        <span>Cucina sarda. Pizza. Convivialità.</span>
        <a href="#info">
          {data.businessInfo.address.city}, {data.businessInfo.address.street} ↗
        </a>
      </div>
    </section>
  );
}
