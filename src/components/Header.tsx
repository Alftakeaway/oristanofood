import type { BusinessInfo, SectionFlags } from '@/lib/site-data';
import { getPhoneHref } from '@/lib/site-utils';
import type { OpenStatus } from '@/lib/open-status';
import OpenStatusBadge from '@/components/OpenStatusBadge';

const NAV_ITEMS: Array<{ key: keyof SectionFlags; href: string; label: string }> = [
  { key: 'menu', href: '#menu', label: 'Menù' },
  { key: 'pizza', href: '#pizza', label: 'Pizza' },
  { key: 'showcase', href: '#showcase', label: 'Specialità' },
  { key: 'wine', href: '#vini', label: 'Vini' },
  { key: 'services', href: '#servizi', label: 'Servizi' },
  { key: 'allergens', href: '#allergeni', label: 'Allergeni' },
  { key: 'booking', href: '#prenota', label: 'Prenota' },
];

interface HeaderProps {
  businessInfo: BusinessInfo;
  status: OpenStatus;
  sections: SectionFlags;
}

export default function Header({ businessInfo, status, sections }: HeaderProps) {
  const nav = NAV_ITEMS.filter((item) => sections[item.key]);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={businessInfo.logo}
            alt={businessInfo.name}
            className="h-10 w-10 rounded-xl"
          />
          <div className="min-w-0">
            <span className="block truncate font-heading text-lg font-semibold leading-tight">
              {businessInfo.name}
            </span>
            <span className="hidden text-xs text-muted md:block">
              {businessInfo.tagline}
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-5 text-[13px] font-medium lg:flex">
          {nav.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="whitespace-nowrap transition hover:text-primary"
            >
              {item.label}
            </a>
          ))}
          <a href="#info" className="whitespace-nowrap transition hover:text-primary">
            Info
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <OpenStatusBadge initial={status} />
          <a
            href={getPhoneHref(businessInfo.phone)}
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold whitespace-nowrap text-white transition hover:brightness-110 sm:px-5 sm:py-2 sm:text-sm"
          >
            <span className="sm:hidden">Chiama</span>
            <span className="hidden sm:inline">Chiama Ora</span>
          </a>
        </div>
      </div>

      <nav
        aria-label="Sezioni del sito"
        className="flex gap-5 overflow-x-auto border-t border-foreground/5 px-4 py-2 text-xs font-medium lg:hidden"
      >
        {nav.map((item) => (
          <a key={item.key} href={item.href} className="shrink-0 whitespace-nowrap transition hover:text-primary">
            {item.label}
          </a>
        ))}
        <a href="#info" className="shrink-0 whitespace-nowrap transition hover:text-primary">
          Info &amp; Orari
        </a>
      </nav>
    </header>
  );
}
