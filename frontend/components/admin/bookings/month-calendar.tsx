import Link from "next/link";

import { BookingRow } from "@/components/admin/bookings/booking-list";
import { ArrowRightIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { addDays, dayHeading, parseKey } from "@/lib/admin/booking-text";
import { formatMonthYear, isoWeekday, weekdayName } from "@/lib/dates";
import { capitalize, cn } from "@/lib/utils";
import type { Booking } from "@/types/booking";
import type { DayHours, DayOff } from "@/types/schedule";

const text = adminText.bookings.calendar;

/** First and last day shown for a month: whole weeks, Monday first. */
export function monthGrid(month: string): { first: string; last: string } {
  const start = `${month}-01`;
  const first = addDays(start, -(isoWeekday(parseKey(start)) - 1));
  const next = parseKey(start);
  next.setMonth(next.getMonth() + 1);
  const monthEnd = addDays(
    `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`,
    -1,
  );
  const last = addDays(monthEnd, 7 - isoWeekday(parseKey(monthEnd)));
  return { first, last };
}

export function shiftMonth(month: string, delta: number): string {
  const date = parseKey(`${month}-01`);
  date.setMonth(date.getMonth() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const href = (month: string, day?: string) =>
  `/admin/bookings?view=calendar&month=${month}${day ? `&day=${day}` : ""}`;

type MonthCalendarProps = {
  month: string;
  selected: string;
  today: string;
  bookings: Booking[];
  hours: DayHours[];
  daysOff: DayOff[];
};

export function MonthCalendar({ month, selected, today, bookings, hours, daysOff }: MonthCalendarProps) {
  const { first, last } = monthGrid(month);
  const cells: string[] = [];
  for (let day = first; day <= last; day = addDays(day, 1)) cells.push(day);

  const byDay = new Map<string, Booking[]>();
  for (const booking of bookings) {
    byDay.set(booking.date, [...(byDay.get(booking.date) ?? []), booking]);
  }
  const isClosed = (key: string) =>
    !hours.find((day) => day.weekday === isoWeekday(parseKey(key)))?.is_open;
  const isOff = (key: string) => daysOff.some((off) => off.starts_on <= key && key <= off.ends_on);

  const selectedBookings = byDay.get(selected) ?? [];
  const activeCount = (items: Booking[]) =>
    items.filter((b) => b.status !== "declined" && b.status !== "cancelled").length;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-display-sm">{capitalize(formatMonthYear(parseKey(`${month}-01`), "sq"))}</h2>
          <div className="flex items-center gap-1">
            <Link
              href={href(shiftMonth(month, -1))}
              scroll={false}
              aria-label={text.previous}
              className="grid size-11 place-items-center border border-line transition-colors hover:border-ink"
            >
              <ArrowRightIcon className="w-4 rotate-180" />
            </Link>
            <Link
              href={href(today.slice(0, 7), today)}
              scroll={false}
              className="grid h-11 place-items-center border border-line px-3 text-small transition-colors hover:border-ink"
            >
              {text.today}
            </Link>
            <Link
              href={href(shiftMonth(month, 1))}
              scroll={false}
              aria-label={text.next}
              className="grid size-11 place-items-center border border-line transition-colors hover:border-ink"
            >
              <ArrowRightIcon className="w-4" />
            </Link>
          </div>
        </div>

        <div role="grid" className="mt-6">
          <div role="row" className="grid grid-cols-7 border-b border-line pb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((weekday) => (
              <span key={weekday} role="columnheader" className="text-center text-eyebrow tracking-[0.16em] text-stone uppercase">
                {weekdayName(weekday, "sq", "short")}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((key) => {
              const items = byDay.get(key) ?? [];
              const active = items.filter((b) => b.status !== "declined" && b.status !== "cancelled");
              const pending = active.some((b) => b.status === "pending");
              const clash = active.some((b) => b.conflicts.length > 0);
              const outside = !key.startsWith(month);
              const quiet = isClosed(key) || isOff(key);
              const isSelected = key === selected;
              return (
                <Link
                  key={key}
                  role="gridcell"
                  href={href(month, key)}
                  scroll={false}
                  aria-selected={isSelected}
                  aria-label={`${dayHeading(key, today)}: ${active.length ? text.count(active.length) : text.dayEmpty}`}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center gap-1 border-b border-line text-small tabular-nums transition-colors sm:aspect-[1/0.85]",
                    isSelected ? "bg-ink text-paper" : "hover:bg-cream",
                    !isSelected && outside && "text-stone/40",
                    !isSelected && !outside && quiet && "text-stone/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full",
                      key === today && !isSelected && "ring-1 ring-ink",
                    )}
                  >
                    {parseKey(key).getDate()}
                  </span>
                  <span className="flex h-1.5 items-center gap-1" aria-hidden="true">
                    {active.slice(0, 3).map((booking) => (
                      <span
                        key={booking.id}
                        className={cn(
                          "size-1.5 rounded-full",
                          booking.status === "pending"
                            ? isSelected ? "border border-paper" : "border border-ink"
                            : isSelected ? "bg-paper" : "bg-ink",
                        )}
                      />
                    ))}
                    {active.length > 3 && <span className="text-[0.625rem] leading-none">+</span>}
                  </span>
                  {clash ? (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-error" aria-hidden="true" />
                  ) : (
                    pending &&
                    !isSelected && (
                      <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-sand" aria-hidden="true" />
                    )
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section id="agenda" aria-labelledby="agenda-title" className="scroll-mt-24">
        <h2 id="agenda-title" className="eyebrow text-ink">
          {dayHeading(selected, today)}
        </h2>
        <p className="mt-2 text-small text-stone">
          {isOff(selected) ? text.dayOff : isClosed(selected) ? text.closed : text.count(activeCount(selectedBookings))}
        </p>
        {selectedBookings.length > 0 ? (
          <ul className="mt-4 border-t border-line">
            {selectedBookings.map((booking) => (
              <li key={booking.id} className="border-b border-line">
                <BookingRow booking={booking} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 border-t border-line pt-5 text-stone">{text.dayEmpty}</p>
        )}
      </section>
    </div>
  );
}
