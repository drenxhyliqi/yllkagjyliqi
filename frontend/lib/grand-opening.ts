/*
 * The grand opening and its opening-week offer, in one place. Times are
 * Kosovo time (Europe/Belgrade in the IANA database; there is no
 * "Europe/Pristina"); +02:00 because summer time runs until 25 October.
 *
 * Everything on the site reads the phase from here, so the countdown, the
 * offer and the booking page change by themselves at the right moment, and
 * disappear when the offer is over.
 */

export const GRAND_OPENING = {
  /** Sunday 4 October 2026, 12:00. */
  opensAt: "2026-10-04T12:00:00+02:00",
  /**
   * "Gjatë javës së hapjes": taken as 4–10 October inclusive, so it ends at
   * midnight after the 10th. TO CONFIRM WITH YLLKA before publishing.
   */
  offerEndsAt: "2026-10-11T00:00:00+02:00",
  discount: 30,
} as const;

/** countdown: before the opening · offer: opening week · over: back to normal. */
export type OpeningPhase = "countdown" | "offer" | "over";

export function openingPhase(now: number = Date.now()): OpeningPhase {
  if (now < Date.parse(GRAND_OPENING.opensAt)) return "countdown";
  if (now < Date.parse(GRAND_OPENING.offerEndsAt)) return "offer";
  return "over";
}

/** Whole days, hours, minutes and seconds until the opening (never negative). */
export function timeUntilOpening(now: number) {
  const total = Math.max(0, Math.floor((Date.parse(GRAND_OPENING.opensAt) - now) / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}
