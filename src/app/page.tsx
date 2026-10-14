import DemoHome from "@/components/demo/DemoHome";
import { getSiteData, getSections } from "@/lib/site-data";
import { resolveBaseUrl } from "@/lib/base-url";
import {
  DAY_ORDER,
  formatSlot,
  getOpenStatus,
  getTodayException,
  type TimeSlot,
} from "@/lib/open-status";
import { DEMO_MODE } from "@/lib/demo-mode";
export default async function Page() {
  if (DEMO_MODE) return <DemoHome />;
  const data = await getSiteData();
  const sections = getSections(data);
  const exceptions = data.exceptions ?? [];
  const status = getOpenStatus(
    data.hours,
    data.businessInfo.timezone,
    new Date(),
    exceptions,
  );
  const exception = getTodayException(exceptions, data.businessInfo.timezone);

  const todaySlots: TimeSlot[] = exception
    ? exception.isOpen
      ? (exception.slots ?? [])
      : []
    : (data.hours[status.today]?.slots ?? []);
  const pickupSlots: string[] = todaySlots.map(formatSlot);

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

  const jsonLdServesCuisine =
    data.businessInfo.cuisine ??
    (data.businessInfo.type === "pizzeria" ? ["Pizza"] : []);

  const jsonMenuSections = [
    ...menuSections,
    ...grouped(pizzaItems).map((group) => ({
      label: group.category,
      items: group.items,
    })),
  ];

  const baseUrl = resolveBaseUrl();
  const logoUrl = data.businessInfo.logo.startsWith("http")
    ? data.businessInfo.logo
    : `${baseUrl}${data.businessInfo.logo.startsWith("/") ? "" : "/"}${data.businessInfo.logo}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": data.businessInfo.type === "bakery" ? "Bakery" : "Restaurant",
    name: data.businessInfo.name,
    description: data.businessInfo.description,
    url: baseUrl,
    image: logoUrl,
    ...(data.businessInfo.priceRange
      ? { priceRange: data.businessInfo.priceRange }
      : {}),
    telephone: data.businessInfo.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: data.businessInfo.address.street,
      addressLocality: data.businessInfo.address.city,
      postalCode: data.businessInfo.address.zip,
      addressCountry: data.businessInfo.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: data.businessInfo.geo.lat,
      longitude: data.businessInfo.geo.lng,
    },
    ...(sections.booking ? { acceptsReservations: "True" } : {}),
    ...(jsonLdServesCuisine.length > 0
      ? { servesCuisine: jsonLdServesCuisine }
      : {}),
    ...(jsonMenuSections.length > 0
      ? {
          hasMenu: {
            "@type": "Menu",
            hasMenuSection: jsonMenuSections.map((section) => ({
              "@type": "MenuSection",
              name: section.label,
              hasMenuItem: section.items.map((item) => ({
                "@type": "MenuItem",
                name: item.title,
                description: item.description,
                offers: {
                  "@type": "Offer",
                  price: item.price.toFixed(2),
                  priceCurrency: "EUR",
                  availability: item.available
                    ? "https://schema.org/InStock"
                    : "https://schema.org/SoldOut",
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
        "@type": "OpeningHoursSpecification",
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <DemoHome />
    </>
  );
}
