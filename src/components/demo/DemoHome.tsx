"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PizzaSection from "@/components/PizzaSection";
import PizzaBuilder from "@/components/PizzaBuilder";
import ServicesSection from "@/components/ServicesSection";
import AllergenSection from "@/components/AllergenSection";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import NoticeBanner from "@/components/NoticeBanner";
import { CartProvider, CartWidget } from "@/components/cart";
import { DietFilterProvider } from "@/components/diet-filter";
import { useDemo, useDemoConfig } from "./DemoProvider";
import { getSections } from "@/lib/site-utils";
import { getOpenStatus, getTodayException } from "@/lib/open-status";
import { getTimeOptions } from "@/lib/booking";
export default function DemoHome() {
  const data = useDemoConfig();
  const { now, resetId } = useDemo();
  const sections = getSections(data);
  const exception = getTodayException(
    data.exceptions,
    data.businessInfo.timezone,
  );
  const status = getOpenStatus(
    data.hours,
    data.businessInfo.timezone,
    now,
    data.exceptions,
  );
  const slots = exception
    ? exception.isOpen
      ? (exception.slots ?? [])
      : []
    : data.hours[status.today].slots;
  const time = new Intl.DateTimeFormat("it-IT", {
    timeZone: data.businessInfo.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  const pickupSlots = getTimeOptions(slots, 15, 15).filter(
    (slot) => slot > time,
  );
  return (
    <CartProvider key={resetId}>
      <DietFilterProvider>
        <Header
          businessInfo={data.businessInfo}
          status={status}
          sections={sections}
        />
        <NoticeBanner exception={exception} />
        <main>
          <Hero data={data} />
          <PizzaBuilder />
          {data.pizza && (
            <PizzaSection items={data.showcase} config={data.pizza} />
          )}
          {data.services && <ServicesSection services={data.services} />}
          <AllergenSection items={data.showcase} />
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
  );
}
