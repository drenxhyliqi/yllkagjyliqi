import "server-only";

import { adminFetch } from "@/lib/admin/api";
import type { Schedule } from "@/types/schedule";

/** The schedule as the signed-in admin sees it. */
export function getAdminSchedule(): Promise<Schedule> {
  return adminFetch<Schedule>("/api/admin/schedule");
}

/** Kosovo is covered by Europe/Belgrade in the IANA database. */
export const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE ?? "Europe/Belgrade";

/** Today's "YYYY-MM-DD" in the business timezone (server-side, so Intl data is complete). */
export function businessToday(timezone: string = BUSINESS_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
