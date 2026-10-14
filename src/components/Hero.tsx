import type { SiteData } from '@/lib/site-data';
import { getDirectionsUrl, getPhoneHref } from '@/lib/site-utils';

interface HeroProps {
  data: SiteData;
}

export default function Hero({ data }: HeroProps) {
  const { businessInfo, styles } = data;
  const colors = styles.colors;

  return (
    <section className="relative flex min-h-[88svh] items-center justify-center overflow-hidden">
      <div
        className="absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${colors.primary}14, transparent)`,
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[460px] w-[720px] rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${colors.accent}1F, transparent)`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-surface/70 px-4 py-1.5 text-sm text-muted">
          {businessInfo.tagline}
        </span>

        <h1 className="font-heading mt-6 text-5xl font-medium tracking-tight md:text-7xl">
          {businessInfo.name}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          {businessInfo.description}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={getPhoneHref(businessInfo.phone)}
            className="w-full rounded-full bg-primary px-8 py-4 text-lg font-semibold whitespace-nowrap text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
          >
            Chiama Ora
          </a>
          <a
            href={getDirectionsUrl(businessInfo.geo)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full border border-foreground/20 bg-surface/60 px-8 py-4 text-lg font-medium transition hover:bg-surface sm:w-auto"
          >
            Avvia Navigatore su Google Maps
          </a>
        </div>

        <a
          href={businessInfo.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-sm text-muted underline-offset-4 transition hover:text-foreground hover:underline"
        >
          Scrivici su WhatsApp
        </a>
      </div>
    </section>
  );
}
