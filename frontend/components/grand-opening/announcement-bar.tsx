"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useOpeningClock } from "@/components/grand-opening/use-opening-clock";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { openingPhase, timeUntilOpening, type OpeningPhase } from "@/lib/grand-opening";

type Copy = Dictionary["grandOpening"]["bar"];

const two = (value: number) => String(value).padStart(2, "0");

/**
 * Thin bar above the navigation: a live countdown to the grand opening, then
 * the opening-week offer, then nothing. The time is worked out in each
 * visitor's browser.
 */
export function AnnouncementBar({
  copy,
  offersHref,
  bookHref,
  initialPhase,
}: {
  copy: Copy;
  offersHref: string;
  bookHref: string;
  /** The phase when the page was rendered on the server. */
  initialPhase: OpeningPhase;
}) {
  const now = useOpeningClock();
  const phase = now === null ? initialPhase : openingPhase(now);

  // The header grows by the bar's height only while the bar is shown.
  useEffect(() => {
    const root = document.documentElement;
    if (phase === "over") root.removeAttribute("data-announce");
    else root.setAttribute("data-announce", "");
  }, [phase]);

  if (phase === "over") return null;

  const shell = (children: React.ReactNode) => (
    <div className="bg-ink text-paper">
      <div className="announce-bar container-site">{children}</div>
    </div>
  );

  const link = (href: string, label: string, short?: string) => (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sand transition-colors hover:text-paper"
    >
      {short ? (
        <>
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
      <ArrowRightIcon className="w-4 transition-transform duration-300 ease-soft group-hover:translate-x-0.5" />
    </Link>
  );

  if (phase === "offer") {
    return shell(
      <>
        <p className="min-w-0 truncate">
          <span className="text-sand">{copy.offerLabel}</span>
          <span aria-hidden="true" className="mx-2 text-paper/40">·</span>
          <span className="hidden sm:inline">{copy.offerText}</span>
          <span className="sm:hidden">{copy.offerShort}</span>
        </p>
        {link(bookHref, copy.book)}
      </>,
    );
  }

  const left = now === null ? null : timeUntilOpening(now);
  const unit = (value: number | undefined, label: string) => (
    <span className="whitespace-nowrap">
      <span className="tabular-nums">{value === undefined ? "--" : two(value)}</span>
      <span className="text-paper/55">{label}</span>
    </span>
  );

  return shell(
    <>
      <p className="hidden min-w-0 truncate md:block">
        <span className="text-sand">{copy.label}</span>
        <span aria-hidden="true" className="mx-2 text-paper/40">·</span>
        {copy.when}
      </p>
      <p className="truncate md:hidden">
        <span className="text-sand">{copy.label}</span>
      </p>
      <p
        role="timer"
        aria-label={copy.countdownLabel}
        // Announced once, not every second.
        aria-live="off"
        className="flex shrink-0 items-center gap-2 sm:gap-3"
      >
        {unit(left?.days, copy.days)}
        {unit(left?.hours, copy.hours)}
        {unit(left?.minutes, copy.minutes)}
        <span className="hidden sm:inline">{unit(left?.seconds, copy.seconds)}</span>
      </p>
      {link(offersHref, copy.viewOffers, copy.viewOffersShort)}
    </>,
  );
}
