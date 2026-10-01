import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { ArrowLink } from "@/components/ui/arrow-link";
import { FacebookIcon, InstagramIcon } from "@/components/ui/icons";
import { RevealLines } from "@/components/ui/reveal-lines";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ImageAsset } from "@/types/image";

export type SocialLink = {
  href: string;
  label: string;
  icon: "instagram" | "facebook";
};

type HeroProps = {
  copy: Dictionary["home"]["hero"];
  bookLabel: string;
  bookingHref: string;
  workHref: string;
  /** In-page anchor for the "Discover" scroll cue. */
  nextSectionId: string;
  image: ImageAsset;
  social: SocialLink[];
};

const icons = { instagram: InstagramIcon, facebook: FacebookIcon };

/** Offset for the staggered entrance, added to --intro-delay. */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/*
 * Full-bleed photograph, dimmed over ink so the statement reads on top of it.
 * The header floats transparently over the hero until the visitor scrolls.
 * The entrance is time-based and waits for the intro loader's curtain to lift.
 */
export function Hero({
  copy,
  bookLabel,
  bookingHref,
  workHref,
  nextSectionId,
  image,
  social,
}: HeroProps) {
  return (
    <section
      // The cookie banner waits until the visitor has scrolled past the hero.
      data-consent-trigger
      className="relative -mt-(--header-h) flex min-h-svh items-center overflow-hidden bg-ink text-paper"
    >
      <div className="hero-media absolute inset-0">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="100vw"
          style={{ objectPosition: image.focalPoint }}
          className="object-cover opacity-45"
        />
      </div>
      {/* A soft shade behind the text, plus darker top (header) and bottom (scroll cue). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgb(17_17_17/0.4),transparent),linear-gradient(to_bottom,rgb(17_17_17/0.55),rgb(17_17_17/0)_28%,rgb(17_17_17/0)_62%,rgb(17_17_17/0.7))]"
      />

      <div className="container-site relative pt-(--header-h) pb-28 text-center">
        <p className="hero-fade eyebrow text-sand" style={delay(0)}>
          {copy.eyebrow}
        </p>
        <h1 className="hero-intro mx-auto mt-8 text-display-xl">
          <RevealLines
            lines={[
              copy.titleStart,
              <>
                <em>{copy.titleEmphasis}</em> {copy.titleEnd}
              </>,
            ]}
          />
        </h1>
        <p
          className="hero-fade mx-auto mt-8 max-w-md text-lead text-paper/80"
          style={delay(450)}
        >
          {copy.text}
        </p>
        <div
          className="hero-fade mt-12 flex flex-col items-center gap-7 sm:flex-row sm:justify-center sm:gap-10"
          style={delay(600)}
        >
          <Link href={bookingHref} className="btn btn-paper w-full sm:w-auto">
            {bookLabel}
          </Link>
          <ArrowLink href={workHref}>{copy.secondaryCta}</ArrowLink>
        </div>
      </div>

      {social.length > 0 && (
        <ul
          className="hero-fade absolute bottom-7 left-(--gutter) flex items-center gap-1 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2 lg:flex-col"
          style={delay(800)}
        >
          <li
            aria-hidden="true"
            className="hidden h-16 w-px bg-paper/30 lg:mb-3 lg:block"
          />
          {social.map(({ href, label, icon }) => {
            const Icon = icons[icon];
            return (
              <li key={icon}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center opacity-75 transition-opacity duration-300 hover:opacity-100"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            );
          })}
          <li
            aria-hidden="true"
            className="hidden h-16 w-px bg-paper/30 lg:mt-3 lg:block"
          />
        </ul>
      )}

      <a
        href={`#${nextSectionId}`}
        className="hero-fade absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-paper/75 transition-colors duration-300 hover:text-paper"
        style={delay(900)}
      >
        <span className="eyebrow">{copy.scroll}</span>
        <span
          aria-hidden="true"
          className="scroll-cue-track block h-12 w-px bg-paper/25"
        />
      </a>
    </section>
  );
}
