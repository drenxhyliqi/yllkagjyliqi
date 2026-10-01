import Link from "next/link";

import { RevealLines } from "@/components/ui/reveal-lines";
import type { Dictionary } from "@/i18n/dictionaries/en";

type BookingCtaProps = {
  copy: Dictionary["home"]["bookingCta"];
  bookLabel: string;
  bookingHref: string;
  contactHref: string;
};

/* The homepage's closing note: one clear action on ink, nothing competing with it. */
export function BookingCta({
  copy,
  bookLabel,
  bookingHref,
  contactHref,
}: BookingCtaProps) {
  return (
    <section
      aria-labelledby="booking-cta-title"
      className="bg-ink section-y text-paper"
    >
      <div className="container-site text-center">
        <p className="eyebrow text-sand">{copy.eyebrow}</p>
        <h2
          id="booking-cta-title"
          className="reveal-lines mx-auto mt-8 text-display-lg"
        >
          <RevealLines
            lines={[
              copy.titleStart,
              <em key="emphasis" className="text-sand">
                {copy.titleEmphasis}
              </em>,
            ]}
          />
        </h2>
        <p className="reveal mx-auto mt-6 max-w-md text-paper/70">
          {copy.text}
        </p>

        <div className="mt-12 flex flex-col items-center gap-8">
          <Link href={bookingHref} className="btn btn-light w-full sm:w-auto">
            {bookLabel}
          </Link>
          <p className="text-small text-paper/60">
            {copy.contactPrompt}{" "}
            <Link href={contactHref} className="link-line text-paper">
              {copy.contactLink}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
