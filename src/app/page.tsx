import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ShowcaseGrid from '@/components/ShowcaseGrid';
import MenuSection from '@/components/MenuSection';
import PizzaSection from '@/components/PizzaSection';
import BookingSection from '@/components/BookingSection';
import ServicesSection from '@/components/ServicesSection';
import WineSection from '@/components/WineSection';
import AllergenSection from '@/components/AllergenSection';
import InfoSection from '@/components/InfoSection';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import NoticeBanner from '@/components/NoticeBanner';
import { CartProvider, CartWidget } from '@/components/cart';
import { DietFilterProvider } from '@/components/diet-filter';
import { getSections, getSiteData } from '@/lib/site-data';
import {
  DAY_ORDER,
  formatSlot,
  getOpenStatus,
  getTodayException,
  type TimeSlot,
} from '@/lib/open-status';

export default async function Page() {
  const data = await getSiteData();
  const sections = getSections(data);
  const exceptions = data.exceptions ?? [];
  const status = getOpenStatus(data.hours, data.businessInfo.timezone, new Date(), exceptions);
  const exception = getTodayException(exceptions, data.businessInfo.timezone);

  const todaySlots: TimeSlot[] = exception
    ? exception.isOpen
      ? (exception.slots ?? [])
      : []
    : (data.hours[status.today]?.slots ?? []);
  const pickupSlots: string[] = todaySlots.map(formatSlot);

  const pizzaCategories = data.pizza?.categories ?? [];
  const pizzaItems = data.showcase.filter((item) => pizzaCategories.includes(item.category));
  const kitchenItems = data.showcase.filter((item) => !pizzaCategories.includes(item.category));
  const featured = data.showcase.filter((item) => item.feature);
  const showcaseItems = featured.length > 0 ? featured : kitchenItems;

  const menuCourses = (data.courses ?? []).filter((course) =>
    kitchenItems.some((item) => item.category === course.category),
  );
  const grouped = (items: typeof data.showcase) =>
    items.reduce<Array<{ category: string; items: typeof data.showcase }>>((acc, item) => {
      const existing = acc.find((section) => section.category === item.category);
      if (existing) {
        existing.items.push(item);
      } else {
        acc.push({ category: item.category, items: [item] });
      }
      return acc;
    }, []);
  const menuSections = menuCourses.map((course) => ({
    label: course.label ?? course.category,
    items: kitchenItems.filter((item) => item.category === course.category),
  }));

  const jsonLdServesCuisine =
    data.businessInfo.cuisine ?? (data.businessInfo.type === 'pizzeria' ? ['Pizza'] : []);

  const jsonMenuSections = [
    ...menuSections,
    ...grouped(pizzaItems).map((group) => ({ label: group.category, items: group.items })),
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': data.businessInfo.type === 'bakery' ? 'Bakery' : 'Restaurant',
    name: data.businessInfo.name,
    description: data.businessInfo.description,
    telephone: data.businessInfo.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.businessInfo.address.street,
      addressLocality: data.businessInfo.address.city,
      postalCode: data.businessInfo.address.zip,
      addressCountry: data.businessInfo.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: data.businessInfo.geo.lat,
      longitude: data.businessInfo.geo.lng,
    },
    ...(sections.booking ? { acceptsReservations: 'True' } : {}),
    ...(jsonLdServesCuisine.length > 0 ? { servesCuisine: jsonLdServesCuisine } : {}),
    ...(jsonMenuSections.length > 0
      ? {
          hasMenu: {
            '@type': 'Menu',
            hasMenuSection: jsonMenuSections.map((section) => ({
              '@type': 'MenuSection',
              name: section.label,
              hasMenuItem: section.items.map((item) => ({
                '@type': 'MenuItem',
                name: item.title,
                description: item.description,
                offers: {
                  '@type': 'Offer',
                  price: item.price.toFixed(2),
                  priceCurrency: 'EUR',
                  availability: item.available
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/SoldOut',
                },
              })),
            })),
          },
        }
      : {}),
    openingHoursSpecification: DAY_ORDER.flatMap((day) => {
      const dayHours = data.hours[day];
      if (!dayHours?.isOpen || dayHours.slots.length === 0) return [];
      const dayOfWeek = `https://schema.org/${day.charAt(0).toUpperCase()}${day.slice(1)}`;
      return dayHours.slots.map((slot) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek,
        opens: slot.open,
        closes: slot.close,
      }));
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CartProvider>
        <DietFilterProvider>
          <Header businessInfo={data.businessInfo} status={status} sections={sections} />
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
            {sections.services && data.services && <ServicesSection services={data.services} />}
            {sections.allergens && <AllergenSection items={data.showcase} />}
            <InfoSection data={data} />
          </main>
          <Footer data={data} />
          <CartWidget whatsapp={data.businessInfo.whatsapp} pickupSlots={pickupSlots} />
          <WhatsAppFloat href={data.businessInfo.whatsapp} />
        </DietFilterProvider>
      </CartProvider>
    </>
  );
}
