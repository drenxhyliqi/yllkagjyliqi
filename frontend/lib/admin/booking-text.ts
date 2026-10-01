import { adminText } from "@/i18n/admin";
import { formatFullDate, isoWeekday, weekdayName } from "@/lib/dates";
import { capitalize } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/booking";

const text = adminText.bookings;

export function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(key: string, days: number): string {
  const date = parseKey(key);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** "Sot · e enjte, 1 tetor 2026", "Nesër · …" or "E shtunë, 3 tetor 2026". */
export function dayHeading(key: string, today: string): string {
  const date = parseKey(key);
  const name = `${weekdayName(isoWeekday(date), "sq")}, ${formatFullDate(date, "sq")}`;
  if (key === today) return `${text.today} · ${name}`;
  if (key === addDays(today, 1)) return `${text.tomorrow} · ${name}`;
  return capitalize(name);
}

/** Message templates in the customer's language. */
export type Template = "confirmed" | "declined" | "cancelled" | "rescheduled" | "reminder";

/** Messages after which the client may want to change or cancel. */
const WITH_LINK: Template[] = ["confirmed", "rescheduled", "reminder"];

export function messageFor(
  template: Template,
  booking: Pick<Booking, "customer_name" | "service_name" | "service_name_en" | "locale">,
  date: string,
  time: string,
  businessName: string,
  /** The client's "manage my booking" link, added where it helps. */
  manageUrl?: string,
): string {
  const locale = booking.locale;
  const templates = text.templates[locale];
  const service = locale === "en" && booking.service_name_en ? booking.service_name_en : booking.service_name;
  const firstName = booking.customer_name.trim().split(/\s+/)[0];
  const message = templates[template](firstName, service, formatFullDate(parseKey(date), locale), time, businessName);
  return manageUrl && WITH_LINK.includes(template) ? `${message}\n\n${templates.manage(manageUrl)}` : message;
}

export const statusLabel = (status: BookingStatus) => text.status[status];
