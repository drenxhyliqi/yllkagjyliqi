import type { Metadata } from "next";

import { BookingCta } from "@/components/home/booking-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { PriceList } from "@/components/prices/price-list";
import { ArrowLink } from "@/components/ui/arrow-link";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getServiceCatalog } from "@/lib/data/services";
import { getNavigation } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { pricesPage } = await getDictionary();
  return pageMetadata(await getLocale(), "/prices", {
    title: pricesPage.title,
    description: pricesPage.description,
  });
}

export default async function PricesPage() {
  const locale = await getLocale();
  const [dict, catalog] = await Promise.all([
    getDictionary(),
    getServiceCatalog(locale),
  ]);
  const navigation = getNavigation(locale, dict);
  const copy = dict.pricesPage;

  return (
    <>
      <PageIntro
        eyebrow={copy.eyebrow}
        titleStart={copy.titleStart}
        titleEmphasis={copy.titleEmphasis}
        text={copy.text}
      >
        <ArrowLink href={localizePath(locale, "/services")} className="mt-8">
          {copy.detailsLink}
        </ArrowLink>
      </PageIntro>
      <PriceList catalog={catalog} locale={locale} pricing={dict.pricing} />
      <BookingCta
        copy={dict.home.bookingCta}
        bookLabel={dict.common.bookAppointment}
        bookingHref={navigation.booking}
        contactHref={navigation.contact}
      />
    </>
  );
}
