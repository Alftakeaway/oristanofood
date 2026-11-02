"use client";
import {LocalizedContent} from "@/i18n";

import {LanguageSwitcher} from "@/i18n";

import { useEffect, useRef, useState } from "react";
import type { BusinessInfo, SectionFlags } from "@/lib/site-data";
import type { OpenStatus } from "@/lib/open-status";
import OpenStatusBadge from "./OpenStatusBadge";
import { MotionToggle } from "./Experience";

const navigation = [
  { key: "showcase", href: "#showcase", label: "La cucina" },
  { key: "menu", href: "#menu", label: "Menù" },
  { key: "pizza", href: "#pizza", label: "La pizza" },
  { key: "wine", href: "#vini", label: "La cantina" },
  { key: "booking", href: "#prenota", label: "Prenota" },
] as const;

export default function Header({
  businessInfo,
  status,
  sections,
}: {
  businessInfo: BusinessInfo;
  status: OpenStatus;
  sections: SectionFlags;
}) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = navigation.filter((item) => sections[item.key]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [open]);

  return <LocalizedContent>{(
    <header className="of-header">
      <div className="of-header__inner">
        <a
          href="/"
          className="of-brand"
          aria-label={`${businessInfo.name} — home`}
        >
          <img src={businessInfo.logo} alt="" width="40" height="40" />
          <span>{businessInfo.name}</span>
        </a>
        <nav className="of-nav" aria-label="Navigazione principale">
          {nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href="#info">Dove siamo</a>
        </nav>
        <div className="of-header__tools">
          <div className="of-header__status">
            <OpenStatusBadge initial={status} />
          </div>
          <MotionToggle />
          <LanguageSwitcher/>
          <a
            className="of-header__book"
            href={sections.booking ? "#prenota" : "#info"}
          >
            {sections.booking ? "A tavola ↗" : "Contatti ↗"}
          </a>
          <button
            ref={toggle}
            type="button"
            className="of-menu-toggle"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className="of-mobile-nav"
        aria-label="Navigazione mobile"
        hidden={!open}
      >
        {nav.map((item) => (
          <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
            {item.label}
            <span aria-hidden="true">↗</span>
          </a>
        ))}
        <a href="#info" onClick={() => setOpen(false)}>
          Dove siamo ↗
        </a>
        {sections.services && (
          <a href="#servizi" onClick={() => setOpen(false)}>
            Servizi
          </a>
        )}
        {sections.allergens && (
          <a href="#allergeni" onClick={() => setOpen(false)}>
            Allergeni
          </a>
        )}
      </nav>
    </header>
  )}</LocalizedContent>;
}
