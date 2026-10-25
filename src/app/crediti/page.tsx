import Link from "next/link";
import credits from "../../../docs/PHOTO-CREDITS.json";

export const metadata = { title: "Crediti fotografici" };

export default function CreditsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="of-text-link">
        ← Torna all’osteria
      </Link>
      <p className="of-eyebrow mt-12">Le fotografie</p>
      <h1 className="font-heading mt-4 text-5xl">
        Immagini reali, fonti aperte.
      </h1>
      <p className="mt-6 leading-relaxed text-muted">
        Questo è un sito dimostrativo. Le fotografie sono immagini reali
        illustrative, non scatti dell’attività immaginaria o dei suoi prodotti.
        Sono state ridimensionate, convertite in WebP e ritagliate
        nell’impaginazione.
      </p>
      <ul className="mt-10 space-y-8">
        {credits.map((photo) => (
          <li key={photo.key} className="border-t border-foreground/20 pt-5">
            <h2 className="font-heading text-2xl capitalize">{photo.key}</h2>
            <p className="mt-2 text-sm">
              {photo.author} ·{" "}
              <a href={photo.licenseUrl} className="underline">
                {photo.license}
              </a>
            </p>
            <a
              className="mt-2 inline-block text-sm underline"
              href={
                "photoId" in photo
                  ? `https://images.unsplash.com/${photo.photoId}`
                  : photo.source
              }
            >
              Fonte originale ↗
            </a>
            <p className="mt-2 text-xs text-muted">
              Le versioni adattate delle fotografie Creative Commons mantengono
              la licenza indicata.
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
