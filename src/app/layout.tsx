import { DemoProvider } from "@/components/demo/DemoProvider";
import { DEMO_MODE } from "@/lib/demo-mode";
import "@/components/demo/demo.css";
import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { resolveBaseUrl } from "@/lib/base-url";
import { fontRegistry, type FontName } from "@/lib/fonts";
import { getSiteData } from "@/lib/site-data";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { businessInfo } = await getSiteData();
  return {
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
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
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
    <html lang="it">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} antialiased`}
        style={cssVars}
      >
        <a href="#main-content" className="of-skip">
          Salta al contenuto
        </a>
        <DemoProvider base={data} renderedAt={new Date().toISOString()}>
          {children}
        </DemoProvider>
      </body>
    </html>
  );
}
import "@/components/demo/merchant.css";
