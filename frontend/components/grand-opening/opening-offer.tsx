import Link from "next/link";

import { WhileOpening } from "@/components/grand-opening/while-opening";
import { RevealLines } from "@/components/ui/reveal-lines";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { GRAND_OPENING, type OpeningPhase } from "@/lib/grand-opening";

type Copy = Dictionary["grandOpening"]["section"];

/** The opening-week offer on the homepage: quiet, but impossible to miss. */
export function OpeningOffer({
  copy,
  bookHref,
  phase,
}: {
  copy: Copy;
  bookHref: string;
  phase: OpeningPhase;
}) {
  if (phase === "over") return null;
  return (
    <WhileOpening initialPhase={phase}>
      <section id="oferta" aria-labelledby="oferta-title" className="scroll-mt-(--header-h) bg-cream">
        <div className="container-site section-y grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-6">
            <p className="reveal eyebrow text-stone">{copy.eyebrow}</p>
            <h2 id="oferta-title" className="reveal-lines mt-6 text-display-xl">
              <RevealLines lines={[copy.title]} />
            </h2>
            <p className="reveal mt-6 max-w-md font-display text-[1.5rem] leading-snug italic">
              {copy.text}
            </p>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <ul className="reveal border-t border-ink/20">
              {copy.offers.map((offer) => (
                <li
                  key={offer}
                  className="flex items-baseline justify-between gap-6 border-b border-ink/20 py-4"
                >
                  <span className="font-display text-[1.375rem]">{offer}</span>
                  <span className="text-label tracking-[0.16em] tabular-nums">−{GRAND_OPENING.discount}%</span>
                </li>
              ))}
            </ul>
            <p className="reveal mt-6 text-small text-stone">{copy.validity}</p>
            <p className="reveal mt-1 text-small text-stone">{copy.opening}</p>
            <Link href={bookHref} className="reveal btn btn-primary mt-10 w-full sm:w-auto">
              {copy.book}
            </Link>
          </div>
        </div>
      </section>
    </WhileOpening>
  );
}
