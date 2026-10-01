import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminPage } from "@/components/admin/admin-page";
import { BookingActions } from "@/components/admin/bookings/booking-actions";
import { CopyLink } from "@/components/admin/bookings/copy-link";
import { ReminderButtons } from "@/components/admin/bookings/reminder-buttons";
import { NoteForm } from "@/components/admin/bookings/note-form";
import { StatusBadge } from "@/components/admin/bookings/status-badge";
import { Flash } from "@/components/admin/flash";
import { adminText } from "@/i18n/admin";
import { getBusinessInfo } from "@/lib/data/business";
import { getBooking } from "@/lib/admin/bookings";
import { addDays, dayHeading, messageFor } from "@/lib/admin/booking-text";
import { callLink, emailLink, smsLink, whatsappLink } from "@/lib/admin/contact-links";
import { durationLabel, priceLabel } from "@/lib/admin/format";
import { businessToday } from "@/lib/admin/schedule";
import { manageUrl } from "@/lib/admin/site-url";
import { getSystemStatus } from "@/lib/admin/system";
import { addressMapUrl } from "@/lib/maps";
import { formatFullDate } from "@/lib/dates";

const text = adminText.bookings.detail;

export const metadata: Metadata = { title: adminText.bookings.title };

const contactButton =
  "flex min-h-11 items-center justify-center border border-line px-4 text-small transition-colors hover:border-ink";

export default async function BookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
  const { id } = await params;
  const [booking, business, system] = await Promise.all([
    getBooking(id),
    getBusinessInfo(),
    getSystemStatus(),
  ]);
  if (!booking) notFound();

  const today = businessToday();
  const clientLink = await manageUrl(booking.manage_token, booking.locale);
  const isTomorrow = booking.date === addDays(today, 1);
  // Read once per request on the server.
  // eslint-disable-next-line react-hooks/purity
  const started = new Date(booking.start_time).getTime() <= Date.now();
  const details = [
    `${booking.start} – ${booking.end}`,
    durationLabel(booking.duration_minutes),
    priceLabel(booking),
  ];
  const subject = `${business.name} – ${booking.service_name}`;
  const created = new Date(booking.created_at);

  return (
    <AdminPage title={booking.service_name} back={{ href: "/admin/bookings", label: text.back }}>
      <div className="-mt-6">
        <StatusBadge status={booking.status} />
        <p className="mt-5 font-display text-display-sm">{dayHeading(booking.date, today)}</p>
        <p className="mt-1 text-stone tabular-nums">{details.join(" · ")}</p>

        {(booking.items.length > 1 || booking.items.some((item) => item.quantity > 1)) && (
          <ul className="mt-5 border-t border-line">
            {booking.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-4 border-b border-line py-2.5 text-small">
                <span>{item.name_sq}</span>
                <span className="shrink-0 text-stone tabular-nums">
                  {text.people(item.quantity)} · {durationLabel(item.duration_minutes * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-5 text-small">
          <span className="text-stone">{text.place}: </span>
          {booking.location === "client" ? (
            <>
              {text.atClient}, {booking.address}{" "}
              {booking.address && (
                <a
                  href={addressMapUrl(booking.address)}
                  target="_blank"
                  rel="noopener"
                  className="whitespace-nowrap underline underline-offset-4"
                >
                  {text.directions}
                </a>
              )}
            </>
          ) : (
            text.studio
          )}
        </p>
        {(booking.block_start !== booking.start || booking.block_end !== booking.end) && (
          <p className="mt-1 text-small text-stone">{text.blocked(booking.block_start, booking.block_end)}</p>
        )}
      </div>

      {booking.client_changed_at && booking.status === "pending" && (
        <p className="mt-6 border-l-2 border-ink bg-sand/50 px-4 py-3 text-small">{text.changedByClient}</p>
      )}
      {booking.cancelled_by === "client" && booking.status === "cancelled" && (
        <p className="mt-6 border-l-2 border-stone bg-cream px-4 py-3 text-small">{text.cancelledByClient}</p>
      )}
      {booking.status === "expired" && (
        <p className="mt-6 border-l-2 border-stone bg-cream px-4 py-3 text-small">{text.expiredText}</p>
      )}

      {booking.conflicts.length > 0 && (
        <section
          aria-labelledby="conflicts"
          role="alert"
          className="mt-8 border border-error bg-error/[0.06] p-5 text-error"
        >
          <h2 id="conflicts" className="flex items-center gap-2.5 font-medium">
            <span aria-hidden="true" className="size-2 rounded-full bg-error" />
            {text.conflictTitle}
          </h2>
          <ul className="mt-3 space-y-1">
            {booking.conflicts.map((other) => (
              <li key={other.id}>
                <Link
                  href={`/admin/bookings/${other.id}`}
                  className="flex min-h-11 items-center justify-between gap-3 border-b border-error/20 py-2 text-ink"
                >
                  <span className="min-w-0">
                    <span className="block tabular-nums">
                      {other.start}–{other.end} · {other.customer_name}
                    </span>
                    <span className="block truncate text-small text-stone">{other.service_name}</span>
                  </span>
                  <StatusBadge status={other.status} />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-small">{text.conflictText}</p>
        </section>
      )}

      <div className="mt-8">
        <BookingActions
          booking={booking}
          businessName={business.name}
          manageUrl={clientLink}
          emailsClient={system.emails && booking.customer_email !== null}
          started={started}
          today={today}
        />
      </div>

      {booking.admin_message && (
        <section aria-labelledby="notify" className="mt-10 border-t border-line pt-8">
          <h2 id="notify" className="font-display text-display-sm">
            {text.notify}
          </h2>
          <p className="mt-2 text-small text-stone">{text.notifyText}</p>
          <blockquote className="mt-4 border-l border-ink pl-4 whitespace-pre-line">
            {booking.admin_message}
          </blockquote>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:flex">
            <a href={whatsappLink(booking.customer_phone, booking.admin_message)} target="_blank" rel="noopener" className={contactButton}>
              {text.whatsapp}
            </a>
            <a href={smsLink(booking.customer_phone, booking.admin_message)} className={contactButton}>
              {text.sms}
            </a>
            {booking.customer_email ? (
              <a href={emailLink(booking.customer_email, subject, booking.admin_message)} className={contactButton}>
                {text.email}
              </a>
            ) : (
              <span className="flex min-h-11 items-center justify-center border border-line/60 px-2 text-center text-[0.6875rem] leading-tight text-stone/70">
                {text.noContactForEmail}
              </span>
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="customer" className="mt-10 border-t border-line pt-8">
        <h2 id="customer" className="eyebrow text-stone">
          {text.customer}
        </h2>
        <p className="mt-3 font-display text-display-sm">{booking.customer_name}</p>
        <p className="mt-1 tabular-nums">{booking.customer_phone}</p>
        {booking.customer_email && (
          <a href={emailLink(booking.customer_email, subject)} className="mt-1 block break-all text-stone underline-offset-4 hover:underline">
            {booking.customer_email}
          </a>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:flex">
          <a href={callLink(booking.customer_phone)} className={contactButton}>
            {text.call}
          </a>
          <a href={whatsappLink(booking.customer_phone)} target="_blank" rel="noopener" className={contactButton}>
            {text.whatsapp}
          </a>
          <a href={smsLink(booking.customer_phone)} className={contactButton}>
            {text.sms}
          </a>
        </div>
        {booking.customer_note && (
          <div className="mt-6">
            <p className="text-label text-stone uppercase">{text.customerNote}</p>
            <p className="mt-2 whitespace-pre-line">“{booking.customer_note}”</p>
          </div>
        )}
      </section>

      {booking.status === "confirmed" && isTomorrow && (
        <section aria-labelledby="reminder" className="mt-10 border-t border-line pt-8">
          <h2 id="reminder" className="font-display text-display-sm">
            {text.reminder}
          </h2>
          <div className="mt-4">
            <ReminderButtons
              id={booking.id}
              phone={booking.customer_phone}
              sent={booking.reminder_sent_at !== null}
              message={messageFor("reminder", booking, booking.date, booking.start, business.name, clientLink)}
            />
          </div>
        </section>
      )}

      <section aria-labelledby="client-link" className="mt-10 border-t border-line pt-8">
        <h2 id="client-link" className="eyebrow text-stone">
          {text.manageLink}
        </h2>
        <p className="mt-2 text-small text-stone">{text.manageLinkHint}</p>
        <div className="mt-2">
          <CopyLink url={clientLink} label={text.copyLink} copied={text.copied} />
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <NoteForm id={booking.id} note={booking.admin_note} />
      </section>

      <dl className="mt-10 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-line pt-6 text-small text-stone">
        <dt>{text.reference}</dt>
        <dd className="tracking-[0.12em] text-ink">{booking.reference}</dd>
        <dt>{text.requested}</dt>
        <dd>
          {formatFullDate(created, "sq")}
          {" · "}
          {booking.source === "admin" ? text.addedByYou : text.viaWebsite}
        </dd>
      </dl>

      <Flash messages={{ created: text.created }} />
    </AdminPage>
  );
}
