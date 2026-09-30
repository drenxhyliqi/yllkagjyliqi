import { Hero } from "@/components/home/hero";
import { Introduction } from "@/components/home/introduction";
import { ServicesPreview } from "@/components/home/services-preview";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getCategories } from "@/lib/data/categories";
import { getNavigation } from "@/lib/navigation";
import { placeholderImages } from "@/lib/placeholder-images";

export default async function HomePage() {
  const locale = await getLocale();
  const [dict, categories] = await Promise.all([getDictionary(), getCategories(locale)]);
  const navigation = getNavigation(locale, dict);
  const heroImage = placeholderImages.heroMakeup;

  return (
    <>
      <Hero
        copy={dict.home.hero}
        bookLabel={dict.common.bookAppointment}
        bookingHref={navigation.booking}
        workHref={navigation.work}
        image={{ src: heroImage.src, alt: heroImage.alt[locale] }}
      />
      <Introduction copy={dict.home.intro} aboutHref={navigation.about} />
      <ServicesPreview copy={dict.home.services} locale={locale} categories={categories} />
    </>
  );
}
