"use client";

import { useTransition } from "react";

import { markReminder } from "@/app/admin/(panel)/bookings/actions";
import { adminText } from "@/i18n/admin";
import { smsLink, whatsappLink } from "@/lib/admin/contact-links";

const text = adminText.reminders;

const button =
  "flex min-h-11 items-center justify-center border border-line px-4 text-small transition-colors hover:border-ink";

/**
 * Opens WhatsApp or SMS with the reminder ready to send, and notes that it
 * went out. Nothing is sent automatically.
 */
export function ReminderButtons({
  id,
  phone,
  message,
  sent,
}: {
  id: string;
  phone: string;
  message: string;
  sent: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const mark = (value: boolean) => startTransition(async () => void (await markReminder(id, value)));

  if (sent) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small">
        <span className="flex items-center gap-2 text-ink">
          <span aria-hidden="true">✓</span>
          {adminText.bookings.detail.reminderSent}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => mark(false)}
          className="min-h-11 cursor-pointer text-stone underline-offset-4 hover:text-ink hover:underline"
        >
          {adminText.bookings.detail.reminderUndo}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={whatsappLink(phone, message)}
        target="_blank"
        rel="noopener"
        onClick={() => mark(true)}
        className={button}
      >
        {text.send}
      </a>
      <a href={smsLink(phone, message)} onClick={() => mark(true)} className={button}>
        {text.sms}
      </a>
      <button
        type="button"
        disabled={pending}
        onClick={() => mark(true)}
        className="min-h-11 cursor-pointer px-2 text-small text-stone underline-offset-4 hover:text-ink hover:underline"
      >
        {text.markSent}
      </button>
    </div>
  );
}
