import { Approach } from "@/components/home/approach";
import { BookingCta } from "@/components/home/booking-cta";
import { FeaturedWork } from "@/components/home/featured-work";
import { Hero, type SocialLink } from "@/components/home/hero";
import { Introduction } from "@/components/home/introduction";
import { ServicesPreview } from "@/components/home/services-preview";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getBusinessInfo } from "@/lib/data/business";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedWork } from "@/lib/data/portfolio";
import { getNavigation } from "@/lib/navigation";
import { placeholderImages } from "@/lib/placeholder-images";

export default async function HomePage() {
  const locale = await getLocale();
  const [dict, categories, featuredWork, business] = await Promise.all([
    getDictionary(),
    getCategories(locale),
    getFeaturedWork(locale),
    getBusinessInfo(),
  ]);
  const navigation = getNavigation(locale, dict);
  const heroImage = placeholderImages.heroMakeup;
  const approachImage = placeholderImages.approachEyeliner;

  const social: SocialLink[] = [];
  if (business.instagram) {
    social.push({
      href: business.instagram.url,
      label: dict.common.instagram,
      icon: "instagram",
    });
  }
  if (business.facebook) {
    social.push({
      href: business.facebook.url,
      label: dict.common.facebook,
      icon: "facebook",
    });
  }

  return (
    <>
      <Hero
        copy={dict.home.hero}
        bookLabel={dict.common.bookAppointment}
        bookingHref={navigation.booking}
        workHref={navigation.work}
        nextSectionId="intro"
        image={{
          src: heroImage.src,
          alt: heroImage.alt[locale],
          focalPoint: "50% 28%",
        }}
        social={social}
      />
      <Introduction copy={dict.home.intro} aboutHref={navigation.about} />
      <ServicesPreview
        copy={dict.home.services}
        locale={locale}
        categories={categories}
      />
      <FeaturedWork
        copy={dict.home.work}
        locale={locale}
        items={featuredWork}
      />
      <Approach
        copy={dict.home.approach}
        image={{ src: approachImage.src, alt: approachImage.alt[locale] }}
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
