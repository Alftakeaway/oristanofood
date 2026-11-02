"use client";
import EditorialMotion from "@/components/EditorialMotion";
import {LocalizedContent} from "@/i18n";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Experience, { KineticBand } from "@/components/Experience";
import Editorial, { Atmosphere } from "@/components/Editorial";
import ShowcaseGrid from "@/components/ShowcaseGrid";
import MenuSection from "@/components/MenuSection";
import PizzaSection from "@/components/PizzaSection";
import BookingSection from "@/components/BookingSection";
import ServicesSection from "@/components/ServicesSection";
import WineSection from "@/components/WineSection";
import AllergenSection from "@/components/AllergenSection";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import NoticeBanner from "@/components/NoticeBanner";
import { CartProvider, CartWidget } from "@/components/cart";
import { DietFilterProvider } from "@/components/diet-filter";
import { getSections } from "@/lib/site-utils";
import { useDemo, useDemoConfig } from "@/components/demo/DemoProvider";
import { getTimeOptions } from "@/lib/booking";
import {
  getOpenStatus,
  getTodayException,
  type TimeSlot,
} from "@/lib/open-status";

export default function DemoHome() {
  const data = useDemoConfig();
  const { resetId, settings, now } = useDemo();
  const sections = getSections(data);
  const exceptions = data.exceptions ?? [];
  const status = getOpenStatus(
    data.hours,
    data.businessInfo.timezone,
    now,
    exceptions,
  );
  const exception = getTodayException(exceptions, data.businessInfo.timezone);

  const todaySlots: TimeSlot[] = exception
    ? exception.isOpen
      ? (exception.slots ?? [])
      : []
    : (data.hours[status.today]?.slots ?? []);
  const pickupSlots: string[] = getTimeOptions(todaySlots, 30, 30);

  const pizzaCategories = data.pizza?.categories ?? [];
  const pizzaItems = data.showcase.filter((item) =>
    pizzaCategories.includes(item.category),
  );
  const kitchenItems = data.showcase.filter(
    (item) => !pizzaCategories.includes(item.category),
  );
  const featured = data.showcase.filter((item) => item.feature);
  const showcaseItems = featured.length > 0 ? featured : kitchenItems;

  return <LocalizedContent>{(
    <><EditorialMotion/>
      <CartProvider key={`${settings.preset}:${resetId}`}>
        <DietFilterProvider key={`${settings.preset}:${resetId}`}>
          <Experience />
          <Header
            businessInfo={data.businessInfo}
            status={status}
            sections={sections}
          />
          <NoticeBanner exception={exception} />
          <main id="main-content">
            <Hero data={data} />
            <KineticBand
              text={
                settings.preset === "original"
                  ? "Terra. Mare. Forno. Fatto a mano."
                  : data.businessInfo.tagline
              }
            />
            {sections.showcase && <ShowcaseGrid items={showcaseItems} />}
            {settings.preset === "original" && <Editorial />}
            {sections.menu && (
              <MenuSection items={kitchenItems} courses={data.courses ?? []} />
            )}
            {sections.pizza && data.pizza && pizzaItems.length > 0 && (
              <PizzaSection items={data.showcase} config={data.pizza} />
            )}
            {sections.wine && data.wine && <WineSection wine={data.wine} />}
            {settings.preset === "original" && <Atmosphere />}
            {sections.booking && data.booking && (
              <BookingSection
                businessInfo={data.businessInfo}
                hours={data.hours}
                exceptions={exceptions}
                config={data.booking}
              />
            )}
            {sections.services && data.services && (
              <ServicesSection services={data.services} />
            )}
            {sections.allergens && <AllergenSection items={data.showcase} />}
            <InfoSection data={data} />
          </main>
          <Footer data={data} />
          <CartWidget
            whatsapp={data.businessInfo.whatsapp}
            pickupSlots={pickupSlots}
          />
          <WhatsAppFloat href={data.businessInfo.whatsapp} />
        </DietFilterProvider>
      </CartProvider>
    </>
  )}</LocalizedContent>;
}
