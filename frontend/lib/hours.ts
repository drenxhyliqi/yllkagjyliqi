import type { Locale } from "@/i18n/config";
import type { OpeningHours } from "@/types/business";

export type HoursRow = {
  /** "Monday – Friday" or "Saturday". */
  days: string;
  /** "09:00 – 18:00", or null when closed. */
  time: string | null;
};

/** 2024-01-01 was a Monday, so weekday n (1 = Monday) falls on 2024-01-n. */
function weekdayName(weekday: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2024, 0, weekday)));
}

function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/** Collapses consecutive days with the same hours: Mon–Fri 09:00–18:00, Sat …, Sun closed. */
export function groupOpeningHours(
  hours: OpeningHours[],
  locale: Locale,
): HoursRow[] {
  const groups: OpeningHours[][] = [];
  for (const day of [...hours].sort((a, b) => a.weekday - b.weekday)) {
    const current = groups.at(-1);
    const previous = current?.at(-1);
    const sameHours =
      previous &&
      previous.weekday === day.weekday - 1 &&
      previous.opens === day.opens &&
      previous.closes === day.closes;
    if (current && sameHours) current.push(day);
    else groups.push([day]);
  }

  return groups.map((group) => {
    const first = weekdayName(group[0].weekday, locale);
    const last = weekdayName(group[group.length - 1].weekday, locale);
    const { opens, closes } = group[0];
    return {
      days: capitalize(group.length > 1 ? `${first} – ${last}` : first),
      time: opens && closes ? `${opens} – ${closes}` : null,
    };
  });
}
