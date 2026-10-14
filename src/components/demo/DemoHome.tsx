"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
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

  const menuCourses = (data.courses ?? []).filter((course) =>
    kitchenItems.some((item) => item.category === course.category),
  );
  const grouped = (items: typeof data.showcase) =>
    items.reduce<Array<{ category: string; items: typeof data.showcase }>>(
      (acc, item) => {
        const existing = acc.find(
          (section) => section.category === item.category,
        );
        if (existing) {
          existing.items.push(item);
        } else {
          acc.push({ category: item.category, items: [item] });
        }
        return acc;
      },
      [],
    );
  const menuSections = menuCourses.map((course) => ({
    label: course.label ?? course.category,
    items: kitchenItems.filter((item) => item.category === course.category),
  }));

  return (
    <>
      <CartProvider key={`${settings.preset}:${resetId}`}>
        <DietFilterProvider key={`${settings.preset}:${resetId}`}>
          <Header
            businessInfo={data.businessInfo}
            status={status}
            sections={sections}
          />
          <NoticeBanner exception={exception} />
          <main>
            <Hero data={data} />
            {sections.booking && data.booking && (
              <BookingSection
                businessInfo={data.businessInfo}
                hours={data.hours}
                exceptions={exceptions}
                config={data.booking}
              />
            )}
            {sections.menu && (
              <MenuSection items={kitchenItems} courses={data.courses ?? []} />
            )}
            {sections.pizza && data.pizza && pizzaItems.length > 0 && (
              <PizzaSection items={data.showcase} config={data.pizza} />
            )}
            {sections.showcase && <ShowcaseGrid items={showcaseItems} />}
            {sections.wine && data.wine && <WineSection wine={data.wine} />}
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
  );
}
