"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuSection from "@/components/MenuSection";
import BookingSection from "@/components/BookingSection";
import ServicesSection from "@/components/ServicesSection";
import WineSection from "@/components/WineSection";
import AllergenSection from "@/components/AllergenSection";
import InfoSection from "@/components/InfoSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import NoticeBanner from "@/components/NoticeBanner";
import { DietFilterProvider } from "@/components/diet-filter";
import { useDemo, useDemoConfig } from "./DemoProvider";
import TastingExperience from "@/components/TastingExperience";
import { getSections } from "@/lib/site-utils";
import { getOpenStatus, getTodayException } from "@/lib/open-status";
export default function DemoHome() {
  const data = useDemoConfig();
  const { now } = useDemo();
  const sections = getSections(data);
  const status = getOpenStatus(
    data.hours,
    data.businessInfo.timezone,
    now,
    data.exceptions,
  );
  return (
    <DietFilterProvider>
      <Header
        businessInfo={data.businessInfo}
        status={status}
        sections={sections}
      />
      <NoticeBanner
        exception={getTodayException(
          data.exceptions,
          data.businessInfo.timezone,
        )}
      />
      <main>
        <Hero data={data} />
        <MenuSection items={data.showcase} courses={data.courses ?? []} />
        <TastingExperience />
        {data.wine && <WineSection wine={data.wine} />}
        {data.booking && (
          <BookingSection
            businessInfo={data.businessInfo}
            hours={data.hours}
            exceptions={data.exceptions}
            config={data.booking}
          />
        )}
        {data.services && <ServicesSection services={data.services} />}
        <AllergenSection items={data.showcase} />
        <InfoSection data={data} />
      </main>
      <Footer data={data} />
      <WhatsAppFloat href={data.businessInfo.whatsapp} />
    </DietFilterProvider>
  );
}
