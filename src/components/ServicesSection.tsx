import type { ServiceItem } from '@/lib/site-data';

export default function ServicesSection({ services }: { services: ServiceItem[] }) {
  if (services.length === 0) return null;

  return (
    <section id="servizi" className="border-y border-foreground/5 bg-background/60 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-heading text-3xl font-medium md:text-4xl">Servizi e informazioni</h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li
              key={service.label}
              className="flex gap-3 rounded-2xl border border-foreground/5 bg-surface p-5 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{service.label}</h3>
                {service.note && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">{service.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
