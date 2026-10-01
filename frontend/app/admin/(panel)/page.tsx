import type { Metadata } from "next";
import Link from "next/link";

import { BookingRow } from "@/components/admin/bookings/booking-list";
import { ConflictBanner } from "@/components/admin/bookings/conflict-banner";
import { ReminderButtons } from "@/components/admin/bookings/reminder-buttons";
import { ArrowRightIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { getBookingSummary, getBookings } from "@/lib/admin/bookings";
import { messageFor } from "@/lib/admin/booking-text";
import { manageUrl } from "@/lib/admin/site-url";
import { getBusinessInfo } from "@/lib/data/business";
import { businessToday, getAdminSchedule } from "@/lib/admin/schedule";
import { requireAdmin } from "@/lib/auth";
import { formatDateRange, formatLongDate, weekdayName } from "@/lib/dates";
import { capitalize, cn } from "@/lib/utils";
import type { DayHours } from "@/types/schedule";

const text = adminText.dashboard;

export const metadata: Metadata = {
  // The layout's title template only applies to child segments.
  title: { absolute: `${adminText.nav.dashboard} — Yllka Admin` },
};

const hhmm = (time: string | null) => time?.slice(0, 5) ?? "";

function hoursLabel(day: DayHours | undefined, closed: string) {
  return day?.is_open ? text.hoursToday(hhmm(day.opens_at), hhmm(day.closes_at)) : closed;
}

export default async function Dashboard() {
  const [admin, schedule, summary, todays, tomorrows, business] = await Promise.all([
    requireAdmin(),
    getAdminSchedule(),
    getBookingSummary(),
    getBookings("today"),
    getBookings("reminders"),
    getBusinessInfo(),
  ]);
  const reminderLinks = await Promise.all(
    tomorrows.map((booking) => manageUrl(booking.manage_token, booking.locale)),
  );

  const today = businessToday(schedule.timezone);
  const [year, month, date] = today.split("-").map(Number);
  const todayDate = new Date(year, month - 1, date);
  const weekday = ((todayDate.getDay() + 6) % 7) + 1;

  const todayOff = schedule.days_off.find((d) => d.starts_on <= today && today <= d.ends_on);
  const nextOff = schedule.days_off.find((d) => d.starts_on > today);
  const todayHours = schedule.hours.find((d) => d.weekday === weekday);
  const firstName = admin.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-3xl px-(--gutter) pt-8 pb-12 lg:px-12 lg:pt-14">
      <p className="eyebrow text-stone">{capitalize(formatLongDate(todayDate, "sq"))}</p>
      <h1 className="mt-4 text-display-md">
        {text.greeting} <span className="italic">{firstName}</span>
      </h1>

      {/* ——— Overlapping bookings: Yllka decides ——— */}
      <ConflictBanner count={summary.conflicts} className="mt-10" />

      {/* ——— Requests waiting for an answer ——— */}
      {summary.pending > 0 && (
        <Link
          href="/admin/bookings?filter=pending"
          className="group mt-10 flex min-h-16 items-center justify-between gap-4 bg-sand px-5 py-4"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="size-2 shrink-0 animate-pulse rounded-full bg-ink" />
            <span>
              {text.pending(summary.pending)}
              <span className="mt-0.5 block text-small text-ink/70">{text.review}</span>
            </span>
          </span>
          <ArrowRightIcon className="w-5 shrink-0 transition-transform duration-300 ease-soft group-hover:translate-x-1" />
        </Link>
      )}

      {/* ——— Today ——— */}
      <section aria-labelledby="today" className="mt-10 bg-ink p-6 text-paper sm:p-8">
        <h2 id="today" className="eyebrow text-paper/60">
          {text.today}
        </h2>
        <p className="mt-3 font-display text-display-sm">
          {todayOff ? text.dayOff : hoursLabel(todayHours, text.closed)}
        </p>
        {todayOff?.note && <p className="mt-1 text-small text-paper/70">{todayOff.note}</p>}
        <Link
          href="/admin/appointments"
          className="mt-6 inline-flex min-h-11 items-center gap-3 text-small text-paper/80 transition-colors hover:text-paper"
        >
          {text.manageSchedule}
          <ArrowRightIcon className="w-5" />
        </Link>
      </section>

      {/* ——— Today's appointments ——— */}
      <section aria-labelledby="bookings" className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 id="bookings" className="eyebrow text-stone">
            {text.bookings}
          </h2>
          <Link href="/admin/bookings" className="-mr-1 inline-flex min-h-11 items-center px-1 text-small underline underline-offset-4">
            {text.allBookings}
          </Link>
        </div>
        {todays.length > 0 ? (
          <ul className="mt-2 border-t border-line">
            {todays.map((booking) => (
              <li key={booking.id} className="border-b border-line">
                <BookingRow booking={booking} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 border-t border-line pt-5 text-stone">{text.noBookingsToday}</p>
        )}
        {summary.upcoming > 0 && (
          <p className="mt-3 text-small text-stone">{text.upcoming(summary.upcoming)}</p>
        )}
      </section>

      {/* ——— Reminders for tomorrow ——— */}
      {tomorrows.length > 0 && (
        <section aria-labelledby="reminders" className="mt-10">
          <h2 id="reminders" className="eyebrow text-stone">
            {adminText.reminders.title}
          </h2>
          <p className="mt-2 text-small text-stone">
            {summary.reminders === 0 ? adminText.reminders.allSent : adminText.reminders.text}
          </p>
          <ul className="mt-3 border-t border-line">
            {tomorrows.map((booking, index) => (
              <li key={booking.id} className="border-b border-line py-4">
                <Link href={`/admin/bookings/${booking.id}`} className="flex items-baseline justify-between gap-4">
                  <span className="min-w-0">
                    <span className="font-display text-[1.25rem] tabular-nums">{booking.start}</span>
                    <span className="ml-3">{booking.customer_name}</span>
                    <span className="block truncate text-small text-stone">{booking.service_name}</span>
                  </span>
                </Link>
                <div className="mt-3">
                  <ReminderButtons
                    id={booking.id}
                    phone={booking.customer_phone}
                    sent={booking.reminder_sent_at !== null}
                    message={messageFor(
                      "reminder",
                      booking,
                      booking.date,
                      booking.start,
                      business.name,
                      reminderLinks[index],
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ——— This week ——— */}
      <section aria-labelledby="week" className="mt-10">
        <h2 id="week" className="eyebrow text-stone">
          {text.weekTitle}
        </h2>
        <ul className="mt-4 border-t border-line">
          {schedule.hours.map((day) => {
            const isToday = day.weekday === weekday;
            return (
              <li
                key={day.weekday}
                className={cn(
                  "flex items-center justify-between gap-4 border-b border-line py-3",
                  !day.is_open && "text-stone",
                )}
              >
                <span className={cn("flex items-center gap-3", isToday && "text-ink")}>
                  <span
                    aria-hidden="true"
                    className={cn("size-1.5 rounded-full", isToday ? "bg-ink" : "bg-transparent")}
                  />
                  {capitalize(weekdayName(day.weekday, "sq"))}
                  {isToday && <span className="sr-only">({text.today})</span>}
                </span>
                <span className="text-right tabular-nums">
                  {hoursLabel(day, adminText.schedule.hours.closed)}
                  {day.is_open && day.break_starts_at && (
                    <span className="block text-small text-stone">
                      {adminText.schedule.hours.breakLabel} {hhmm(day.break_starts_at)}–{hhmm(day.break_ends_at)}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ——— Next day off ——— */}
      <section aria-labelledby="next-off" className="mt-10">
        <h2 id="next-off" className="eyebrow text-stone">
          {text.nextDayOff}
        </h2>
        {nextOff ? (
          <p className="mt-3 font-display text-[1.375rem] leading-snug">
            {formatDateRange(nextOff.starts_on, nextOff.ends_on, "sq")}
            {nextOff.note && (
              <span className="block font-sans text-small text-stone">{nextOff.note}</span>
            )}
          </p>
        ) : (
          <p className="mt-3 text-stone">{text.noDayOff}</p>
        )}
      </section>


    </div>
  );
}
