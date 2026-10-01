import Image from "next/image";
import Link from "next/link";

import { ArrowLink } from "@/components/ui/arrow-link";
import { RevealLines } from "@/components/ui/reveal-lines";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cn } from "@/lib/utils";
import type { PortfolioItem } from "@/types/portfolio";

type FeaturedWorkProps = {
  copy: Dictionary["home"]["work"];
  locale: Locale;
  items: PortfolioItem[];
};

/*
 * Four deliberately placed frames rather than an equal grid: a large feature,
 * a smaller image stepping down beside it, then a second row offset the other
 * way with a landscape crop. Phones alternate full and two-thirds widths.
 */
const slots = [
  {
    item: "col-span-12 lg:col-span-7",
    frame: "aspect-[4/5]",
    sizes: "(min-width: 64rem) 55vw, 100vw",
  },
  {
    item: "col-span-8 col-start-5 lg:col-span-4 lg:col-start-9 lg:self-end",
    frame: "aspect-[3/4]",
    sizes: "(min-width: 64rem) 30vw, 66vw",
  },
  {
    item: "col-span-8 lg:col-span-4 lg:col-start-2",
    frame: "aspect-[4/5]",
    sizes: "(min-width: 64rem) 30vw, 66vw",
  },
  {
    item: "col-span-12 lg:col-span-6 lg:col-start-7 lg:mt-40",
    frame: "aspect-[5/4]",
    sizes: "(min-width: 64rem) 48vw, 100vw",
  },
];

export function FeaturedWork({ copy, locale, items }: FeaturedWorkProps) {
  const featured = items.slice(0, slots.length);
  if (featured.length === 0) return null;

  const workHref = localizePath(locale, "/work");

  return (
    <section aria-labelledby="work-title" className="section-y">
      <div className="container-site">
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="eyebrow text-stone">{copy.eyebrow}</p>
            <h2 id="work-title" className="reveal-lines mt-6 text-display-lg">
              <RevealLines
                lines={[
                  copy.titleStart,
                  <em key="emphasis">{copy.titleEmphasis}</em>,
                ]}
              />
            </h2>
            <p className="reveal mt-6 max-w-md text-stone">{copy.text}</p>
          </div>
          <div className="mb-3 hidden shrink-0 lg:block">
            <ArrowLink href={workHref}>{copy.link}</ArrowLink>
          </div>
        </div>

        <ul className="mt-14 grid grid-cols-12 gap-x-4 gap-y-14 lg:mt-20 lg:gap-x-8 lg:gap-y-24">
          {featured.map((item, index) => {
            const slot = slots[index];
            return (
              <li key={item.id} className={cn("reveal", slot.item)}>
                <Link
                  href={localizePath(locale, `/work/${item.slug}`)}
                  className="group block"
                >
                  <div
                    className={cn(
                      "relative overflow-hidden bg-sand",
                      slot.frame,
                    )}
                  >
                    <Image
                      src={item.cover.src}
                      alt={item.cover.alt}
                      fill
                      sizes={slot.sizes}
                      style={{ objectPosition: item.cover.focalPoint }}
                      className="object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="font-display text-[1.375rem] leading-snug">
                      {item.title}
                    </h3>
                    <p className="eyebrow text-stone">{item.category.name}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex justify-center lg:hidden">
          <ArrowLink href={workHref}>{copy.link}</ArrowLink>
        </div>
      </div>
    </section>
  );
}
