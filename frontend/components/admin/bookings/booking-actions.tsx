"use client";

import { useActionState, useState, useTransition } from "react";

import { rescheduleBooking, setBookingStatus } from "@/app/admin/(panel)/bookings/actions";
import { FormFooter } from "@/components/admin/form-footer";
import { adminText } from "@/i18n/admin";
import { messageFor, type Template } from "@/lib/admin/booking-text";
import type { FormState } from "@/lib/admin/mutate";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types/booking";

const text = adminText.bookings.detail;

type Panel = "confirmed" | "declined" | "cancelled" | "reschedule";

type BookingActionsProps = {
  booking: Booking;
  businessName: string;
  /** The client's own link, added to the messages. */
  manageUrl: string;
  /** The client gets decisions by email automatically. */
  emailsClient: boolean;
  /** The appointment has started (or is over). */
  started: boolean;
  today: string;
};

function MessageField({
  value,
  onChange,
  emailed,
}: {
  value: string;
  onChange: (value: string) => void;
  emailed: boolean;
}) {
  return (
    <label className="block">
      <span className="text-label text-stone uppercase">{text.message}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        maxLength={1000}
        className="input mt-1.5 min-h-28 resize-y bg-paper"
      />
      <span className="mt-1.5 block text-small text-stone">
        {emailed ? text.messageHintEmail : text.messageHint}
      </span>
    </label>
  );
}

/** Approve, decline, cancel and the rest, each with a message for the customer. */
export function BookingActions({
  booking,
  businessName,
  manageUrl,
  emailsClient,
  started,
  today,
}: BookingActionsProps) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const open = (next: Panel) => {
    setError(undefined);
    setPanel(next);
    if (next !== "reschedule") {
      setMessage(messageFor(next as Template, booking, booking.date, booking.start, businessName, manageUrl));
    }
  };

  const change = (status: BookingStatus, withMessage: string | null) =>
    startTransition(async () => {
      setError(undefined);
      const result = await setBookingStatus(booking.id, status, withMessage);
      if (result.status === "error") setError(result.message);
      else setPanel(null);
    });

  const statusPanel = (status: "confirmed" | "declined" | "cancelled", confirmLabel: string) => (
    <div className="space-y-5 bg-cream/60 p-5">
      <MessageField value={message} onChange={setMessage} emailed={emailsClient} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => change(status, message)}
          className={cn(
            "btn grow sm:grow-0",
            status === "confirmed" ? "btn-primary" : "border-error bg-error text-paper",
          )}
        >
          {pending ? adminText.common.saving : confirmLabel}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setPanel(null)}
          className="btn btn-outline grow sm:grow-0"
        >
          {adminText.common.cancel}
        </button>
      </div>
    </div>
  );

  const quick = (label: string, status: BookingStatus, variant: "primary" | "outline" = "outline") => (
    <button
      type="button"
      disabled={pending}
      onClick={() => change(status, null)}
      className={cn("btn grow sm:grow-0", variant === "primary" ? "btn-primary" : "btn-outline")}
    >
      {label}
    </button>
  );

  let content: React.ReactNode = null;
  if (panel === "reschedule") {
    content = (
      <ReschedulePanel
        booking={booking}
        businessName={businessName}
        manageUrl={manageUrl}
        emailsClient={emailsClient}
        today={today}
        onClose={() => setPanel(null)}
      />
    );
  } else if (panel) {
    content = statusPanel(
      panel,
      panel === "confirmed" ? text.confirmApprove : panel === "declined" ? text.confirmDecline : text.confirmCancel,
    );
  } else {
    switch (booking.status) {
      case "pending":
        content = (
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button type="button" onClick={() => open("confirmed")} className="btn btn-primary">
              {text.approve}
            </button>
            <button type="button" onClick={() => open("declined")} className="btn btn-outline">
              {text.decline}
            </button>
            {!started && (
              <button
                type="button"
                onClick={() => open("reschedule")}
                className="col-span-2 min-h-11 text-small underline underline-offset-4 sm:ml-2"
              >
                {text.reschedule}
              </button>
            )}
          </div>
        );
        break;
      case "confirmed":
        content = started ? (
          <div className="grid grid-cols-2 gap-3 sm:flex">
            {quick(text.complete, "completed", "primary")}
            {quick(text.noShow, "no_show")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button type="button" onClick={() => open("reschedule")} className="btn btn-outline">
              {text.reschedule}
            </button>
            <button type="button" onClick={() => open("cancelled")} className="btn btn-outline text-error">
              {text.cancel}
            </button>
          </div>
        );
        break;
      case "completed":
      case "no_show":
        content = <div className="flex">{quick(text.undo, "confirmed")}</div>;
        break;
      case "declined":
        content = !started && <div className="flex">{quick(text.reopen, "pending")}</div>;
        break;
      case "cancelled":
        content = !started && <div className="flex">{quick(text.reopen, "confirmed")}</div>;
        break;
    }
  }

  if (!content) return null;
  return (
    <section aria-labelledby="actions-title">
      <h2 id="actions-title" className="sr-only">
        {text.actions}
      </h2>
      {content}
      {error && (
        <p role="alert" className="mt-3 text-small text-error">
          {error}
        </p>
      )}
    </section>
  );
}

function ReschedulePanel({
  booking,
  businessName,
  manageUrl,
  emailsClient,
  today,
  onClose,
}: {
  booking: Booking;
  businessName: string;
  manageUrl: string;
  emailsClient: boolean;
  today: string;
  onClose: () => void;
}) {
  const [date, setDate] = useState(booking.date);
  const [time, setTime] = useState(booking.start);
  // The suggested message follows the new time until Yllka edits it herself.
  const [edited, setEdited] = useState<string | null>(null);
  const message = edited ?? messageFor("rescheduled", booking, date, time, businessName, manageUrl);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (previous, formData) => {
      const result = await rescheduleBooking(booking.id, previous, formData);
      if (result.status === "saved") onClose();
      return result;
    },
    { status: "idle" },
  );

  return (
    <form action={formAction} className="space-y-5 bg-cream/60 p-5">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-label text-stone uppercase">{text.newDate}</span>
          <input
            type="date"
            name="date"
            required
            min={today}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="input mt-1.5 bg-paper tabular-nums"
          />
        </label>
        <label className="block">
          <span className="text-label text-stone uppercase">{text.newTime}</span>
          <input
            type="time"
            name="time"
            required
            step={300}
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="input mt-1.5 bg-paper tabular-nums"
          />
        </label>
      </div>
      <input type="hidden" name="message" value={message} />
      <MessageField value={message} onChange={setEdited} emailed={emailsClient} />
      <FormFooter state={state} pending={pending} label={text.confirmReschedule} />
      <button type="button" onClick={onClose} className="min-h-11 text-small underline underline-offset-4">
        {adminText.common.cancel}
      </button>
    </form>
  );
}
