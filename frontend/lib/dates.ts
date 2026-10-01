import type { Locale } from "@/i18n/config";

/*
 * Month and weekday names, spelled out rather than taken from Intl: browsers
 * such as Chrome ship without Albanian locale data and silently fall back to
 * English, which would also make server and browser output differ.
 */

const months: Record<Locale, string[]> = {
  sq: [
    "janar",
    "shkurt",
    "mars",
    "prill",
    "maj",
    "qershor",
    "korrik",
    "gusht",
    "shtator",
    "tetor",
    "nëntor",
    "dhjetor",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
};

/** Monday first, matching ISO weekdays 1–7. */
const weekdaysLong: Record<Locale, string[]> = {
  sq: [
    "e hënë",
    "e martë",
    "e mërkurë",
    "e enjte",
    "e premte",
    "e shtunë",
    "e diel",
  ],
  en: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
};

const weekdaysShort: Record<Locale, string[]> = {
  sq: ["hën", "mar", "mër", "enj", "pre", "sht", "die"],
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}

export function weekdayName(
  isoDay: number,
  locale: Locale,
  style: "long" | "short" = "long",
) {
  return (style === "long" ? weekdaysLong : weekdaysShort)[locale][isoDay - 1];
}

/** "Saturday, 10 October" / "e shtunë, 10 tetor". */
export function formatLongDate(date: Date, locale: Locale): string {
  return `${weekdayName(isoWeekday(date), locale)}, ${date.getDate()} ${months[locale][date.getMonth()]}`;
}

/** "October 2026" / "tetor 2026". */
export function formatMonthYear(date: Date, locale: Locale): string {
  return `${months[locale][date.getMonth()]} ${date.getFullYear()}`;
}

/** "1 October 2026" / "1 tetor 2026". */
export function formatFullDate(date: Date, locale: Locale): string {
  return `${date.getDate()} ${months[locale][date.getMonth()]} ${date.getFullYear()}`;
}

/** Parses a "YYYY-MM-DD" key as a local calendar date (no timezone shift). */
function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Calendar days from start to end, both included. */
export function daysInRange(startKey: string, endKey: string): number {
  const ms = parseDateKey(endKey).getTime() - parseDateKey(startKey).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/**
 * "12 tetor 2026", "12–15 tetor 2026" or "28 tetor – 2 nëntor 2026":
 * repeats only the parts that differ.
 */
export function formatDateRange(startKey: string, endKey: string, locale: Locale): string {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (startKey === endKey) return formatFullDate(start, locale);

  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear && start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${formatFullDate(end, locale)}`;
  }
  const head = sameYear
    ? `${start.getDate()} ${months[locale][start.getMonth()]}`
    : formatFullDate(start, locale);
  return `${head} – ${formatFullDate(end, locale)}`;
}

/** Weekday name for a "YYYY-MM-DD" key. */
export function weekdayOfKey(key: string, locale: Locale): string {
  return weekdayName(isoWeekday(parseDateKey(key)), locale);
}
