/*
 * Calendar date keys for the booking wizard. Which times are free is decided
 * by the API (GET /api/availability), never in the browser.
 *
 * Dates are "YYYY-MM-DD" keys and times "HH:MM", in the business's local
 * time (Europe/Belgrade, which covers Kosovo).
 */

export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromDateKey(key: DateKey): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}
