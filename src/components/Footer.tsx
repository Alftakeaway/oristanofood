import { DEMO_MODE } from "@/lib/demo-mode";
import type { SiteData } from '@/lib/site-data';
import { formatAddress, getPhoneHref } from '@/lib/site-utils';

interface FooterProps {
  data: SiteData;
}

export default function Footer({ data }: FooterProps) {
  const { businessInfo } = data;

  return (
    <footer id="contatti" className="bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="font-heading text-2xl">{businessInfo.name}</p>
        <p className="mt-1 text-sm opacity-80">{businessInfo.tagline}</p>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm opacity-90">
          <span>{formatAddress(businessInfo.address)}</span>
          <a href={getPhoneHref(businessInfo.phone)}>{businessInfo.phone}</a>
          <a href={businessInfo.whatsapp} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-background/10 pt-6 text-xs opacity-70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {businessInfo.name} · Tutti i diritti riservati
          </p>
          <p className="flex gap-4"><a href="/privacy" className="underline underline-offset-2 hover:opacity-100">Privacy</a><span>{DEMO_MODE ? "Gestione dimostrativa nel browser" : "Sito autogestito · Aggiornato via WhatsApp"}</span></p>
        </div>
      </div>
    </footer>
  );
}
