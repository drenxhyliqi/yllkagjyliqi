import type { Metadata } from "next";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { PageIntro } from "@/components/layout/page-intro";
import { WhileOpening } from "@/components/grand-opening/while-opening";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getBookingOptions } from "@/lib/data/booking-options";
import { getServiceCatalog } from "@/lib/data/services";
import { getNavigation } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";
import { openingPhase } from "@/lib/grand-opening";

export async function generateMetadata(): Promise<Metadata> {
  const { bookingPage } = await getDictionary();
  return pageMetadata(await getLocale(), "/book", {
    title: bookingPage.title,
    description: bookingPage.description,
  });
}

export default async function BookPage({
  searchParams,
}: PageProps<"/[locale]/book">) {
  const locale = await getLocale();
  const [dict, catalog, options, { service }] = await Promise.all([
    getDictionary(),
    getServiceCatalog(locale),
    getBookingOptions(locale),
    searchParams,
  ]);
  const navigation = getNavigation(locale, dict);
  const copy = dict.bookingPage;

  // Only services with a set duration can be booked online; the rest
  // (e.g. group bookings) are arranged by contacting Yllka.
  const bookable = catalog
    .map((category) => ({
      ...category,
      services: category.services.filter(
        (entry) => entry.durationMinutes !== null,
      ),
    }))
    .filter((category) => category.services.length > 0);

  // Opening-week wording and offer, until the offer ends (worked out per request).
  const phase = openingPhase();
  const opening = phase !== "over";

  return (
    <>
      <PageIntro
        eyebrow={copy.eyebrow}
        titleStart={opening ? dict.grandOpening.booking.titleStart : copy.titleStart}
        titleEmphasis={opening ? dict.grandOpening.booking.titleEmphasis : copy.titleEmphasis}
        text={copy.text}
      />
      {opening && (
        <WhileOpening initialPhase={phase}>
          <div className="container-site -mt-6 mb-12 lg:-mt-8 lg:mb-16">
            <aside
              aria-label={dict.grandOpening.booking.eyebrow}
              className="flex flex-col gap-4 border border-ink bg-cream px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
            >
              <div>
                <p className="eyebrow text-stone">{dict.grandOpening.booking.eyebrow}</p>
                <p className="mt-2 font-display text-display-sm">{dict.grandOpening.booking.discount}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-display text-[1.25rem]">
                  {dict.grandOpening.section.offers.join(" · ")}
                </p>
                <p className="mt-1 text-small text-stone">{dict.grandOpening.booking.dates}</p>
              </div>
            </aside>
          </div>
        </WhileOpening>
      )}
      <BookingWizard
        locale={locale}
        catalog={bookable}
        initialService={typeof service === "string" ? service : null}
        options={options}
        copy={copy}
        pricing={dict.pricing}
        links={{
          contact: navigation.contact,
          privacy: localizePath(locale, "/privacy"),
          home: navigation.home,
        }}
      />
    </>
  );
}
