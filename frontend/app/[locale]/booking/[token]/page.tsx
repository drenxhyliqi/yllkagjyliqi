import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ManageActions } from "@/components/booking/manage-actions";
import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { ApiError, apiFetch } from "@/lib/api";
import { formatLongDate } from "@/lib/format";
import { capitalize, cn } from "@/lib/utils";
import type { ManagedBooking } from "@/types/booking";

export const metadata: Metadata = {
  // A private link: never in search results.
  robots: { index: false, follow: false },
};

async function getManaged(token: string): Promise<ManagedBooking | null> {
  try {
    return await apiFetch<ManagedBooking>(`/api/bookings/manage/${encodeURIComponent(token)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export default async function ManageBookingPage({ params }: PageProps<"/[locale]/booking/[token]">) {
  const { token } = await params;
  const [locale, dict, booking] = await Promise.all([getLocale(), getDictionary(), getManaged(token)]);
  const copy = dict.managePage;

  // A proper 404 (with the friendly page in not-found.tsx), not a "success".
  if (!booking) notFound();

  const active = booking.status === "pending" || booking.status === "confirmed";
  const name = (item: ManagedBooking["items"][number]) => {
    const label = locale === "en" && item.name_en ? item.name_en : item.name_sq;
    return item.quantity > 1 ? `${label} × ${item.quantity}` : label;
  };
  const rows = [
    { label: copy.services, value: booking.items.map(name).join(", ") },
    { label: copy.date, value: capitalize(formatLongDate(booking.date, locale)) },
    { label: copy.time, value: `${booking.start} – ${booking.end}` },
    {
      label: copy.place,
      value: booking.location === "client" ? (booking.address ?? "") : copy.studio,
    },
    { label: copy.reference, value: booking.reference },
  ];
  const phone = booking.business_phone;

  return (
    <div className="container-site pt-10 pb-24 lg:pt-16 lg:pb-32">
      <div className="max-w-2xl">
        <p className="eyebrow text-stone">{copy.eyebrow}</p>
        <h1 className="mt-5 text-display-lg">{copy.status[booking.status]}</h1>
        <p className="mt-4 text-lead text-stone">{copy.statusText[booking.status]}</p>

        <dl className="mt-10 border-t border-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
              <dt className="eyebrow w-28 shrink-0 text-stone">{row.label}</dt>
              <dd
                className={cn(
                  "min-w-0 flex-1 text-right font-display text-[1.1875rem] break-words lining-nums",
                  !active && "text-stone",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10">
          {booking.can_change ? (
            <ManageActions
              token={token}
              locale={locale}
              copy={copy}
              bookingCopy={dict.bookingPage}
              date={booking.date}
            />
          ) : active ? (
            <p className="text-stone">
              {copy.deadlinePassed}{" "}
              {phone && (
                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-ink underline underline-offset-4">
                  {phone}
                </a>
              )}
            </p>
          ) : (
            <Link href={localizePath(locale, "/book")} className="btn btn-primary">
              {copy.bookAgain}
            </Link>
          )}
        </div>

        {active && booking.policy && (
          <div className="mt-10 bg-cream/70 p-5 text-small">
            <p className="eyebrow text-stone">{copy.policy}</p>
            <p className="mt-2 whitespace-pre-line">{booking.policy}</p>
          </div>
        )}

        {booking.can_change && phone && (
          <p className="mt-8 text-small text-stone">
            {copy.contact}{" "}
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="text-ink underline underline-offset-4">
              {phone}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
