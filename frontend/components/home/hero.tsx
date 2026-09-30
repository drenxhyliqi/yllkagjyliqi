import Image from "next/image";
import Link from "next/link";

import { ArrowLink } from "@/components/ui/arrow-link";
import type { Dictionary } from "@/i18n/dictionaries/en";

type HeroProps = {
  copy: Dictionary["home"]["hero"];
  bookLabel: string;
  bookingHref: string;
  workHref: string;
  image: { src: string; alt: string };
};

/*
 * Editorial split: the statement sits on paper, the photograph runs to the
 * right edge of the screen at full height. On phones the photograph comes
 * first, since most visitors arrive from Instagram to see the work.
 */
export function Hero({ copy, bookLabel, bookingHref, workHref, image }: HeroProps) {
  return (
    <section className="lg:grid lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(var(--gutter),1fr)_minmax(0,calc(var(--container)*0.48))_minmax(0,calc(var(--container)*0.52))_minmax(var(--gutter),1fr)]">
      <div className="relative aspect-[4/5] max-h-[64svh] w-full overflow-hidden bg-sand sm:aspect-[5/4] lg:col-[3/5] lg:row-start-1 lg:aspect-auto lg:max-h-none">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="(min-width: 64rem) 56vw, 100vw"
          className="object-cover object-[50%_30%] lg:object-center"
        />
      </div>

      <div className="container-site pt-10 pb-4 sm:pt-14 sm:pb-8 lg:col-[2/3] lg:row-start-1 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:px-0 lg:py-24 lg:pr-[clamp(2rem,3vw,3.5rem)]">
        <p className="eyebrow text-stone">{copy.eyebrow}</p>
        <h1 className="mt-6 text-display-xl lg:mt-8">
          {copy.titleStart}
          <br />
          <em>{copy.titleEmphasis}</em> {copy.titleEnd}
        </h1>
        <p className="mt-6 max-w-sm text-lead text-stone lg:mt-8">{copy.text}</p>

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10 lg:mt-12">
          <Link href={bookingHref} className="btn btn-primary w-full sm:w-auto">
            {bookLabel}
          </Link>
          <ArrowLink href={workHref} className="self-center sm:self-auto">
            {copy.secondaryCta}
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
