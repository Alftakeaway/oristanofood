import type { BusinessInfo, SectionFlags } from "@/lib/site-data";
import type { OpenStatus } from "@/lib/open-status";
import OpenStatusBadge from "./OpenStatusBadge";
import { DEMO_LABEL } from "@/lib/demo-identity";
export default function Header({
  businessInfo,
  status,
}: {
  businessInfo: BusinessInfo;
  status: OpenStatus;
  sections: SectionFlags;
}) {
  const pizza = true;
  const nav = pizza
    ? [
        ["Le pizze", "#pizza"],
        ["Crea la tua", "#componi"],
        ["Ritiro e orari", "#info"],
      ]
    : [
        ["La carta", "#menu"],
        ["Degustazioni", "#degustazione"],
        ["Vini", "#vini"],
        ["Il tuo tavolo", "#prenota"],
      ];
  return (
    <header className="venue-header">
      <a className="venue-brand" href="#inizio">
        <img src={businessInfo.logo} alt="" width="44" height="44" />
        <span>
          {businessInfo.name}
          <small>{DEMO_LABEL} · locale immaginario</small>
        </span>
      </a>
      <nav aria-label="Navigazione principale">
        {nav.map(([label, href]) => (
          <a href={href} key={href}>
            {label}
          </a>
        ))}
      </nav>
      <OpenStatusBadge initial={status} />
      <a className="venue-header-cta" href={pizza ? "#componi" : "#prenota"}>
        {pizza ? "Componi la pizza" : "Prova a prenotare"}
      </a>
    </header>
  );
}
