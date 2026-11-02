
import {LocalizedContent} from "@/i18n";
import type { WineConfig } from "@/lib/site-data";
import { formatPrice } from "@/lib/format";
import Image from "next/image";

export default function WineSection({ wine }: { wine: WineConfig }) {
  const groups = wine.groups.filter((group) => group.items.length > 0);
  if (groups.length === 0) return null;

  return <LocalizedContent>{(
    <section id="vini" className="py-20 of-wine">
      <div className="mx-auto max-w-6xl px-4">
        <div className="of-wine__intro" data-reveal>
          <div>
            <p className="of-eyebrow">La cantina / 04</p>
            <h2 className="font-heading text-3xl font-medium md:text-4xl">
              Ancora un calice.
              <br />
              <em>Ancora una storia.</em>
            </h2>
            {wine.note && (
              <p className="max-w-md text-sm text-muted">{wine.note}</p>
            )}
          </div>
          <div className="of-wine__photo">
            <Image
              src="/photos/vino.webp"
              alt="Calici di vino rosso durante un brindisi a tavola"
              fill
              sizes="(max-width: 800px) 100vw, 45vw"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-x-14 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="font-heading text-xl text-primary">
                {group.label}
              </h3>
              <ul className="mt-3 space-y-3">
                {group.items.map((entry) => (
                  <li key={entry.name}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">{entry.name}</span>
                      <span
                        aria-hidden="true"
                        className="flex-1 border-b border-dotted border-foreground/25"
                      />
                      <span className="shrink-0 text-xs text-muted tabular-nums">
                        {entry.glass !== undefined && (
                          <span>{formatPrice(entry.glass)} cal.</span>
                        )}
                        {entry.glass !== undefined &&
                          entry.bottle !== undefined && <span> · </span>}
                        {entry.bottle !== undefined && (
                          <span>{formatPrice(entry.bottle)} bott.</span>
                        )}
                      </span>
                    </div>
                    {entry.producer && (
                      <p className="mt-0.5 text-xs italic text-muted">
                        {entry.producer}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )}</LocalizedContent>;
}
