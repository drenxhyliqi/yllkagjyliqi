import { localizePath, type Locale } from "@/i18n/config";
import { SITE_URL } from "@/lib/seo";
import type { BusinessInfo } from "@/types/business";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Business details for search engines (schema.org BeautySalon), built only
 * from what is filled in under Cilësimet: nothing is invented.
 */
export function LocalBusinessData({ business, locale }: { business: BusinessInfo; locale: Locale }) {
  const sameAs = [business.instagram?.url, business.facebook?.url].filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: business.name,
    url: `${SITE_URL}${localizePath(locale, "/")}`,
    image: `${SITE_URL}/brand/yllka-logo.png`,
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
    ...(business.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: business.address.street,
        ...(business.address.city && { addressLocality: business.address.city }),
        addressCountry: "XK",
      },
    }),
    ...(business.mapsUrl && { hasMap: business.mapsUrl }),
    ...(business.hours.some((day) => day.opens) && {
      openingHoursSpecification: business.hours
        .filter((day) => day.opens && day.closes)
        .map((day) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: DAYS[day.weekday - 1],
          opens: day.opens,
          closes: day.closes,
        })),
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
  return (
    <script
      type="application/ld+json"
      // "<" escaped so text from the admin can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
