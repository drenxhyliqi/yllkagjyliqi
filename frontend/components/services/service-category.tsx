import Image from "next/image";

import { ArrowLink } from "@/components/ui/arrow-link";
import { NoBreakHyphens } from "@/components/ui/no-break-hyphens";
import { RevealLines } from "@/components/ui/reveal-lines";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatDuration, formatPrice } from "@/lib/format";
import type { CategoryWithServices } from "@/types/service";

type ServiceCategoryProps = {
  category: CategoryWithServices;
  locale: Locale;
  pricing: Dictionary["pricing"];
  bookLabel: string;
};

/*
 * One category on the Services page. Large screens: photo, name and
 * description stay in view on the left while the services scroll by on the
 * right. The id matches the homepage links (/services#hair).
 */
export function ServiceCategory({
  category,
  locale,
  pricing,
  bookLabel,
}: ServiceCategoryProps) {
  const titleId = `${category.slug}-title`;

  return (
    <section
      id={category.slug}
      aria-labelledby={titleId}
      className="scroll-mt-16 border-b border-line py-16 last:border-b-0 lg:py-24"
    >
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(4.5rem+3.5rem+2rem)]">
            {category.image && (
              <div className="reveal relative aspect-[3/2] overflow-hidden bg-sand lg:aspect-[4/5]">
                <Image
                  src={category.image.src}
                  alt={category.image.alt}
                  fill
                  sizes="(min-width: 64rem) 30vw, 100vw"
                  style={{ objectPosition: category.image.focalPoint }}
                  className="object-cover"
                />
              </div>
            )}
            <h2 id={titleId} className="reveal-lines mt-8 text-display-md">
              <RevealLines lines={[category.name]} />
            </h2>
            <p className="mt-3 max-w-sm text-stone">{category.description}</p>
          </div>
        </div>

        <ul className="lg:col-span-7 lg:col-start-6">
          {category.services.map((service) => (
            <li
              key={service.id}
              className="reveal flex flex-col gap-4 border-b border-line py-7 first:pt-0 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
            >
              <div className="max-w-md">
                <h3 className="font-display text-[1.5rem] leading-tight">
                  <NoBreakHyphens text={service.name} />
                </h3>
                {service.description && (
                  <p className="mt-2 text-stone">{service.description}</p>
                )}
                {service.durationMinutes !== null && (
                  <p className="eyebrow mt-3 text-stone">
                    {formatDuration(service.durationMinutes, pricing)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center justify-between gap-6 sm:flex-col sm:items-end sm:gap-3">
                <p className="font-display text-[1.5rem] leading-tight whitespace-nowrap lining-nums">
                  {formatPrice(service, locale, pricing)}
                </p>
                <ArrowLink
                  href={localizePath(locale, `/book?service=${service.slug}`)}
                >
                  {bookLabel}
                  <span className="sr-only"> {service.name}</span>
                </ArrowLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
