import type { Metadata } from "next";
import Image from "next/image";

import { Approach } from "@/components/home/approach";
import { BookingCta } from "@/components/home/booking-cta";
import { PageIntro } from "@/components/layout/page-intro";
import { ArrowLink } from "@/components/ui/arrow-link";
import { Logo } from "@/components/ui/logo";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getNavigation } from "@/lib/navigation";
import { placeholderImages } from "@/lib/placeholder-images";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { aboutPage } = await getDictionary();
  return pageMetadata(await getLocale(), "/about", {
    title: aboutPage.title,
    description: aboutPage.description,
  });
}

export default async function AboutPage() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const navigation = getNavigation(locale, dict);
  const copy = dict.aboutPage;
  // TEMPORARY: a photo of the craft, not of a person, until Yllka's portrait arrives.
  const image = placeholderImages.aboutBrushes;
  const approachImage = placeholderImages.approachEyeliner;
  const [lead, ...rest] = copy.story;

  return (
    <>
      <PageIntro
        eyebrow={copy.eyebrow}
        titleStart={copy.titleStart}
        titleEmphasis={copy.titleEmphasis}
        text={copy.text}
      />

      <section aria-labelledby="story-title" className="pb-24 lg:pb-32">
        <div className="container-site grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div className="reveal relative aspect-[4/5] overflow-hidden bg-sand lg:col-span-5">
            <Image
              src={image.src}
              alt={image.alt[locale]}
              fill
              sizes="(min-width: 64rem) 40vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <h2 id="story-title" className="eyebrow text-stone">
              {copy.storyEyebrow}
            </h2>
            <p className="reveal mt-8 font-display text-display-sm text-ink">
              {lead}
            </p>
            <div className="reveal mt-8 space-y-5 text-lead text-stone">
              {rest.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <Logo className="mt-10 h-9 w-auto" />
            <div className="mt-12 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:gap-10">
              <ArrowLink href={navigation.work}>{copy.workLink}</ArrowLink>
              <ArrowLink href={localizePath(locale, "/services")}>
                {copy.servicesLink}
              </ArrowLink>
            </div>
          </div>
        </div>
      </section>

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
