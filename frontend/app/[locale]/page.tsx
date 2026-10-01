import type { Metadata } from "next";

import { Approach } from "@/components/home/approach";
import { BookingCta } from "@/components/home/booking-cta";
import { FeaturedWork } from "@/components/home/featured-work";
import { Hero, type SocialLink } from "@/components/home/hero";
import { Introduction } from "@/components/home/introduction";
import { ServicesPreview } from "@/components/home/services-preview";
import { OpeningOffer } from "@/components/grand-opening/opening-offer";
import { LocalBusinessData } from "@/components/seo/local-business-data";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getBusinessInfo } from "@/lib/data/business";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedWork } from "@/lib/data/portfolio";
import { getNavigation } from "@/lib/navigation";
import { placeholderImages } from "@/lib/placeholder-images";
import { openingPhase } from "@/lib/grand-opening";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return {
    ...pageMetadata(locale, "/", { title: dict.meta.title, description: dict.meta.description }),
    // The full name, without the " — Yllka" added to other pages.
    title: { absolute: dict.meta.title },
  };
}

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
      <LocalBusinessData business={business} locale={locale} />
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
      <OpeningOffer
        copy={dict.grandOpening.section}
        bookHref={navigation.booking}
        // eslint-disable-next-line react-hooks/purity
        phase={openingPhase(Date.now())}
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
