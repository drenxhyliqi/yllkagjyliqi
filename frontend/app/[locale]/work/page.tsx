import type { Metadata } from "next";

import { BookingCta } from "@/components/home/booking-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { WorkGallery } from "@/components/work/work-gallery";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getCategories } from "@/lib/data/categories";
import { getPortfolio } from "@/lib/data/portfolio";
import { getNavigation } from "@/lib/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const { workPage } = await getDictionary();
  return { title: workPage.title, description: workPage.description };
}

export default async function WorkPage() {
  const locale = await getLocale();
  const [dict, items, categories] = await Promise.all([
    getDictionary(),
    getPortfolio(locale),
    getCategories(locale),
  ]);
  const navigation = getNavigation(locale, dict);
  const copy = dict.workPage;

  return (
    <>
      <PageIntro
        eyebrow={copy.eyebrow}
        titleStart={copy.titleStart}
        titleEmphasis={copy.titleEmphasis}
        text={copy.text}
      />
      <WorkGallery
        items={items.map((item) => ({
          ...item,
          href: localizePath(locale, `/work/${item.slug}`),
        }))}
        categories={categories.map(({ slug, name }) => ({ slug, label: name }))}
        copy={{ filterLabel: copy.filterLabel, all: copy.all }}
      />
      <BookingCta
        copy={dict.home.bookingCta}
        bookLabel={dict.common.bookAppointment}
        bookingHref={navigation.booking}
        contactHref={navigation.contact}
      />
    </>
  );
}
