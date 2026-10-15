import type { SiteData } from "@/lib/site-data";
import {
  formatAddress,
  getDirectionsUrl,
  getMapsEmbedUrl,
  getPhoneHref,
} from "@/lib/site-utils";
import type { DayKey } from "@/lib/open-status";
import {
  DAY_ORDER,
  formatSlot,
  getItalianDayName,
  getTodayKey,
} from "@/lib/open-status";

interface InfoSectionProps {
  data: SiteData;
}

export default function InfoSection({ data }: InfoSectionProps) {
  const { businessInfo } = data;
  const today: DayKey = getTodayKey(businessInfo.timezone);

  return (
    <section id="info" className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-heading text-3xl font-medium md:text-4xl">
          Orari e contatti
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-foreground/5 bg-surface p-6 shadow-sm">
            <div>
              {DAY_ORDER.map((day) => {
                const slots = data.hours[day]?.slots ?? [];
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className="flex items-center justify-between border-b border-foreground/5 py-3 text-sm last:border-0"
                  >
                    <span
                      className={
                        isToday
                          ? "flex items-center gap-2 font-semibold"
                          : undefined
                      }
                    >
                      {isToday && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      {getItalianDayName(day)}
                    </span>
                    <span className="text-muted">
                      {slots.length > 0
                        ? slots.map(formatSlot).join("  ·  ")
                        : "Chiuso"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={getPhoneHref(businessInfo.phone)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Chiama ora
              </a>
              <a
                href={businessInfo.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-foreground/20 px-5 py-2.5 text-sm font-medium transition hover:bg-background"
              >
                Scrivi su WhatsApp
              </a>
            </div>
          </div>

          <div>
            <div className="venue-address">
              <span aria-hidden="true">⌖</span>
              <h3>Il tuo locale, a Oristano</h3>
              <p>
                Qui appariranno la mappa e i recapiti della tua attività. Questa
                è una demo: l’indirizzo è immaginario.
              </p>
            </div>
            <p className="mt-4 text-sm text-muted">
              {formatAddress(businessInfo.address)}
            </p>
            <a
              href={getDirectionsUrl(businessInfo.geo)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Indicazioni stradali
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
