import Link from "next/link";

import { StatusBadge } from "@/components/admin/bookings/status-badge";
import { ArrowRightIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { dayHeading } from "@/lib/admin/booking-text";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/booking";

/** One booking: time, service, customer and status. Opens the details. */
export function BookingRow({ booking }: { booking: Booking }) {
  const inactive = booking.status === "declined" || booking.status === "cancelled";
  return (
    <Link
      href={`/admin/bookings/${booking.id}`}
      className="group grid grid-cols-[4.25rem_1fr_auto] items-center gap-x-4 py-4 transition-colors hover:bg-cream/50 sm:grid-cols-[5.5rem_1fr_auto]"
    >
      <span className={cn("tabular-nums", inactive && "text-stone")}>
        <span className="block font-display text-[1.375rem] leading-none">{booking.start}</span>
        <span className="mt-1 block text-small text-stone">{booking.end}</span>
      </span>
      <span className="min-w-0">
        <span className={cn("block truncate", inactive && "text-stone line-through")}>
          {booking.service_name}
        </span>
        <span className="mt-0.5 block truncate text-small text-stone">
          {booking.customer_name}
          {booking.location === "client" && ` · ${adminText.bookings.detail.atClient}`}
        </span>
        {booking.client_changed_at && booking.status === "pending" && (
          <span className="mt-1 block text-small text-ink">{adminText.bookings.detail.changedByClient.split(".")[0]}.</span>
        )}
        {booking.conflicts.length > 0 && <ConflictLine booking={booking} />}
        <StatusBadge status={booking.status} className="mt-2 sm:hidden" />
      </span>
      <span className="flex items-center gap-4">
        <StatusBadge status={booking.status} className="hidden sm:inline-flex" />
        <ArrowRightIcon className="w-4 text-stone transition-transform duration-300 ease-soft group-hover:translate-x-1 group-hover:text-ink" />
      </span>
    </Link>
  );
}

/** Red note: this booking overlaps another one and needs a decision. */
export function ConflictLine({ booking }: { booking: Booking }) {
  const [first, ...rest] = booking.conflicts;
  const text = adminText.bookings;
  return (
    <span className="mt-1.5 flex items-start gap-1.5 text-small leading-snug text-error">
      <span aria-hidden="true" className="mt-[0.45em] size-1.5 shrink-0 rounded-full bg-error" />
      <span>
        {text.conflictWith} {first.customer_name} ({first.start}–{first.end})
        {rest.length > 0 && ` ${text.conflictMore(rest.length)}`}
      </span>
    </span>
  );
}

/** Bookings grouped under a heading per day, in the order given. */
export function BookingList({ bookings, today }: { bookings: Booking[]; today: string }) {
  const days: { date: string; items: Booking[] }[] = [];
  for (const booking of bookings) {
    const last = days.at(-1);
    if (last?.date === booking.date) last.items.push(booking);
    else days.push({ date: booking.date, items: [booking] });
  }

  return (
    <div className="space-y-10">
      {days.map((day) => (
        <section key={day.date} aria-labelledby={`day-${day.date}`}>
          <h2
            id={`day-${day.date}`}
            className={cn("eyebrow pb-3", day.date === today ? "text-ink" : "text-stone")}
          >
            {dayHeading(day.date, today)}
          </h2>
          <ul className="border-t border-line">
            {day.items.map((booking) => (
              <li key={booking.id} className="border-b border-line">
                <BookingRow booking={booking} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
