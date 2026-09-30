import Image from "next/image";
import Link from "next/link";

import { ArrowLink } from "@/components/ui/arrow-link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Category } from "@/types/category";

type ServicesPreviewProps = {
  copy: Dictionary["home"]["services"];
  locale: Locale;
  categories: Category[];
};

/*
 * An editorial index of the service categories rather than a row of cards.
 * Phones: each row carries its own small photo. Large screens: the photos
 * share one panel beside the list and change as rows are hovered or focused
 * (see .services-index in globals.css — no JavaScript involved).
 */
export function ServicesPreview({ copy, locale, categories }: ServicesPreviewProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="services-title" className="bg-cream section-y">
      <div className="container-site">
        <div className="grid gap-y-8 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <div className="lg:col-span-7">
            <p className="eyebrow text-stone">{copy.eyebrow}</p>
            <h2 id="services-title" className="reveal mt-6 text-display-lg">
              {copy.titleStart}
              <br />
              <em>{copy.titleEmphasis}</em>
            </h2>
          </div>
          <div className="reveal lg:col-span-4 lg:col-start-9">
            <p className="max-w-sm text-stone">{copy.text}</p>
            <ArrowLink href={localizePath(locale, "/services")} className="mt-6">
              {copy.link}
            </ArrowLink>
          </div>
        </div>

        <ul className="services-index reveal relative mt-14 lg:mt-20">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className="border-b border-line first:border-t lg:w-[58%]"
            >
              <Link
                href={localizePath(locale, `/services#${category.slug}`)}
                className="group grid grid-cols-[5rem_1fr_auto] items-center gap-5 py-5 sm:grid-cols-[6.5rem_1fr_auto] sm:gap-8 lg:grid-cols-[3rem_1fr_auto] lg:py-9"
              >
                {category.image && (
                  <div className="services-index__image relative aspect-[4/5] overflow-hidden bg-sand lg:pointer-events-none lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[36%]">
                    <Image
                      src={category.image.src}
                      alt={category.image.alt}
                      fill
                      sizes="(min-width: 64rem) 36vw, (min-width: 40rem) 6.5rem, 5rem"
                      className="object-cover"
                    />
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className="hidden self-start pt-2.5 text-label text-stone lg:block"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="services-index__text transition-opacity duration-500 ease-soft">
                  <h3 className="text-display-md transition-transform duration-500 ease-soft lg:group-hover:translate-x-2">
                    {category.name}
                  </h3>
                  <p className="mt-1.5 text-small text-stone sm:text-body">
                    {category.description}
                  </p>
                </div>
                <ArrowRightIcon className="w-5 transition-transform duration-300 ease-soft group-hover:translate-x-1 lg:w-6" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
