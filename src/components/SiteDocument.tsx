import {localiseMetadata} from "@/i18n/server";
import {NextLocaleProvider} from '@/i18n/next-provider';
import { DemoProvider } from "@/components/demo/DemoProvider";
import { DEMO_MODE } from "@/lib/demo-mode";
import "@/components/demo/demo.css";
import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { resolveBaseUrl } from "@/lib/base-url";
import { fontRegistry, type FontName } from "@/lib/fonts";
import { getSiteData } from "@/lib/site-data";


export async function generateMetadata(): Promise<Metadata> {
  const { businessInfo } = await getSiteData();
  return localiseMetadata({
    title: {
      default: `${businessInfo.name} — ${businessInfo.tagline}`,
      template: `%s · ${businessInfo.name}`,
    },
    robots: DEMO_MODE ? { index: false, follow: false } : undefined,
    description: businessInfo.description,
    metadataBase: new URL(resolveBaseUrl()),
    alternates: { canonical: resolveBaseUrl() },
    openGraph: {
      title: businessInfo.name,
      description: businessInfo.description,
      url: resolveBaseUrl(),
      type: "website",
      locale: "it_IT",
      images: [
        {
          url: "/photos/fregola.webp",
          width: 1600,
          height: 1200,
          alt: "Fregola ai frutti di mare — Osteria Fenicio",
        },
      ],
    },
  }, "/");
}

export default async function SiteDocument({
  children,language='it',
}: {
  children: ReactNode;language?: 'it'|'en-GB';
}) {
  const locale=language;
  const data = await getSiteData();
  const { colors, fonts } = data.styles;

  const headingFont =
    fontRegistry[fonts.heading as FontName] ?? fontRegistry["Playfair Display"];
  const bodyFont = fontRegistry[fonts.body as FontName] ?? fontRegistry.Inter;

  const cssVars = {
    "--site-primary": colors.primary,
    "--site-secondary": colors.secondary,
    "--site-accent": colors.accent,
    "--site-background": colors.background,
    "--site-surface": colors.surface,
    "--site-foreground": colors.foreground,
    "--site-muted": colors.muted,
    "--font-heading": headingFont.style.fontFamily,
    "--font-body": bodyFont.style.fontFamily,
  } as unknown as CSSProperties;

  return (
    <html lang={locale}>
      <body
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
        style={cssVars}
      >
        <a href="#main-content" className="of-skip">
          {locale === 'it' ? 'Salta al contenuto' : 'Skip to content'}
        </a>
        <NextLocaleProvider locale={locale}><DemoProvider base={data} renderedAt={new Date().toISOString()}>
          {children}
        </DemoProvider></NextLocaleProvider>
      </body>
    </html>
  );
}
import "@/components/demo/merchant.css";
