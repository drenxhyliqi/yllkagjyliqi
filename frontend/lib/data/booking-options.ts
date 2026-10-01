import "server-only";

import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { contentTags } from "@/lib/content-tags";
import { publicFetch } from "@/lib/data/public-api";
import type { BookingRules } from "@/types/schedule";

/** Rules the booking page shows, in the visitor's language. */
export type BookingOptions = {
  homeVisits: boolean;
  homeVisitNote: string | null;
  cancellationHours: number;
  policy: string | null;
};

const pick = (sq: string | null, en: string | null, locale: Locale) =>
  locale === "en" && en ? en : sq;

export const getBookingOptions = cache(async (locale: Locale): Promise<BookingOptions> => {
  const { settings } = await publicFetch<{ settings: BookingRules }>(
    "/api/schedule",
    contentTags.business,
  );
  return {
    homeVisits: settings.home_visits,
    homeVisitNote: pick(settings.home_visit_note_sq, settings.home_visit_note_en, locale),
    cancellationHours: settings.cancellation_notice_hours,
    policy: pick(settings.policy_sq, settings.policy_en, locale),
  };
});
