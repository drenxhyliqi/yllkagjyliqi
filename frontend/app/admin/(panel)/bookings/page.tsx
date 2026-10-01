import type { Metadata } from "next";
import Link from "next/link";

import { AdminPage } from "@/components/admin/admin-page";
import { BookingList } from "@/components/admin/bookings/booking-list";
import { ConflictBanner } from "@/components/admin/bookings/conflict-banner";
import { MonthCalendar, monthGrid } from "@/components/admin/bookings/month-calendar";
import { ArrowRightIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import {
  BOOKING_VIEWS,
  getBookingSummary,
  getBookings,
  getBookingsBetween,
  type BookingView,
} from "@/lib/admin/bookings";
import { businessToday, getAdminSchedule } from "@/lib/admin/schedule";
import { cn } from "@/lib/utils";

const text = adminText.bookings;

export const metadata: Metadata = { title: text.title };

const tab = (current: boolean) =>
  cn(
    "flex min-h-11 items-center justify-center px-4 text-small transition-colors",
    current ? "bg-ink text-paper" : "text-ink hover:bg-cream",
  );

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const params = await searchParams;
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);

  const mode = one("view") === "calendar" ? "calendar" : "list";
  const filter: BookingView = BOOKING_VIEWS.includes(one("filter") as BookingView)
    ? (one("filter") as BookingView)
    : "upcoming";
  const today = businessToday();
  const month = /^\d{4}-\d{2}$/.test(one("month") ?? "") ? one("month")! : today.slice(0, 7);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(one("day") ?? "")
    ? one("day")!
    : today.startsWith(month)
      ? today
      : `${month}-01`;

  const summary = await getBookingSummary();

  return (
    <AdminPage
      eyebrow={text.eyebrow}
      title={text.title}
      actions={
        <Link href="/admin/bookings/new" className="btn btn-sm btn-primary grow sm:grow-0">
          {text.newBooking}
        </Link>
      }
    >
      <ConflictBanner count={summary.conflicts} className="mb-3" />
      {summary.pending > 0 && !(mode === "list" && filter === "pending") && (
        <Link
          href="/admin/bookings?filter=pending"
          className="group mb-8 flex min-h-14 items-center justify-between gap-4 bg-sand px-5 py-3"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-ink" />
            {text.pendingCount(summary.pending)}
          </span>
          <ArrowRightIcon className="w-5 transition-transform duration-300 ease-soft group-hover:translate-x-1" />
        </Link>
      )}

      <nav aria-label={text.title} className="grid grid-cols-2 border border-ink sm:inline-grid sm:w-72">
        <Link href="/admin/bookings" aria-current={mode === "list" ? "page" : undefined} className={tab(mode === "list")}>
          {text.views.list}
        </Link>
        <Link
          href="/admin/bookings?view=calendar"
          aria-current={mode === "calendar" ? "page" : undefined}
          className={cn(tab(mode === "calendar"), "border-l border-ink")}
        >
          {text.views.calendar}
        </Link>
      </nav>

      <div className="mt-8">
        {mode === "list" ? (
          <ListView filter={filter} today={today} pending={summary.pending} />
        ) : (
          <CalendarView month={month} day={day} today={today} />
        )}
      </div>

    </AdminPage>
  );
}

async function ListView({ filter, today, pending }: { filter: BookingView; today: string; pending: number }) {
  const bookings = await getBookings(filter);
  return (
    <>
      <nav aria-label={text.views.list} className="-mx-(--gutter) overflow-x-auto px-(--gutter) [scrollbar-width:none]">
        <ul className="flex w-max gap-2">
          {BOOKING_VIEWS.map((view) => (
            <li key={view}>
              <Link
                href={view === "upcoming" ? "/admin/bookings" : `/admin/bookings?filter=${view}`}
                aria-current={view === filter ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-2 border px-4 text-small whitespace-nowrap transition-colors",
                  view === filter ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                )}
              >
                {text.filters[view]}
                {view === "pending" && pending > 0 && (
                  <span className={cn("tabular-nums", view === filter ? "text-paper/70" : "text-stone")}>{pending}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">
        {bookings.length > 0 ? (
          <BookingList bookings={bookings} today={today} />
        ) : (
          <p className="border-y border-line py-12 text-center text-stone">{text.empty[filter]}</p>
        )}
      </div>
    </>
  );
}

async function CalendarView({ month, day, today }: { month: string; day: string; today: string }) {
  const { first, last } = monthGrid(month);
  const [bookings, schedule] = await Promise.all([getBookingsBetween(first, last), getAdminSchedule()]);
  return (
    <MonthCalendar
      month={month}
      selected={day}
      today={today}
      bookings={bookings}
      hours={schedule.hours}
      daysOff={schedule.days_off}
    />
  );
}
