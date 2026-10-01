import type { Metadata } from "next";

import { BookingCta } from "@/components/home/booking-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { CategoryNav } from "@/components/services/category-nav";
import { ServiceCategory } from "@/components/services/service-category";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getServiceCatalog } from "@/lib/data/services";
import { getNavigation } from "@/lib/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const { servicesPage } = await getDictionary();
  return { title: servicesPage.title, description: servicesPage.description };
}

export default async function ServicesPage() {
  const locale = await getLocale();
  const [dict, catalog] = await Promise.all([
    getDictionary(),
    getServiceCatalog(locale),
  ]);
  const navigation = getNavigation(locale, dict);
  const copy = dict.servicesPage;

  return (
    <>
      <PageIntro
        eyebrow={copy.eyebrow}
        titleStart={copy.titleStart}
        titleEmphasis={copy.titleEmphasis}
        text={copy.text}
      />
      <CategoryNav
        label={copy.categoriesNav}
        items={catalog.map(({ slug, name }) => ({ slug, label: name }))}
      />
      {catalog.map((category) => (
        <ServiceCategory
          key={category.id}
          category={category}
          locale={locale}
          pricing={dict.pricing}
          bookLabel={copy.book}
        />
      ))}
      <BookingCta
        copy={dict.home.bookingCta}
        bookLabel={dict.common.bookAppointment}
        bookingHref={navigation.booking}
        contactHref={navigation.contact}
      />
    </>
  );
}
