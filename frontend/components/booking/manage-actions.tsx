"use client";

import { useEffect, useState, useTransition } from "react";

import { cancelBooking, moveBooking, type ManageResult } from "@/app/[locale]/booking/[token]/actions";
import { DateTimeStep, ErrorText } from "@/components/booking/booking-steps";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fromDateKey, type DateKey } from "@/lib/booking/availability";
import type { Availability } from "@/types/booking";

type ManageActionsProps = {
  token: string;
  locale: Locale;
  copy: Dictionary["managePage"];
  bookingCopy: Dictionary["bookingPage"];
  /** The booking's current day, to open the calendar there. */
  date: string;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

/** Change the time or cancel, from the client's own link. */
export function ManageActions({ token, locale, copy, bookingCopy, date: currentDate }: ManageActionsProps) {
  const [panel, setPanel] = useState<"none" | "move" | "cancel">("none");
  const [result, setResult] = useState<ManageResult>({ status: "idle" });
  const [pending, startTransition] = useTransition();
  const [availability, setAvailability] = useState<Availability | null | "error">(null);
  const [month, setMonth] = useState(() => startOfMonth(fromDateKey(currentDate)));
  const [date, setDate] = useState<DateKey | null>(null);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    if (panel !== "move") return;
    let cancelled = false;
    fetch(`/api/manage/${encodeURIComponent(token)}/availability`)
      .then((response) => (response.ok ? response.json() : "error"))
      .catch(() => "error")
      .then((data: Availability | "error") => {
        if (!cancelled) setAvailability(data);
      });
    return () => {
      cancelled = true;
    };
  }, [panel, token]);

  const run = (action: () => Promise<ManageResult>) =>
    startTransition(async () => {
      const next = await action();
      setResult(next);
      if (next.status === "done") setPanel("none");
    });

  const error = result.status === "error" ? copy.errors[result.error] : null;

  if (panel === "cancel") {
    return (
      <div className="bg-cream p-5" role="group" aria-label={copy.cancelQuestion}>
        <p className="font-display text-[1.375rem]">{copy.cancelQuestion}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => cancelBooking(token))}
            className="btn btn-primary grow sm:grow-0"
          >
            {pending ? copy.cancelling : copy.cancelYes}
          </button>
          <button type="button" onClick={() => setPanel("none")} className="btn btn-outline grow sm:grow-0">
            {copy.keep}
          </button>
        </div>
        {error && <ErrorText>{error}</ErrorText>}
      </div>
    );
  }

  if (panel === "move") {
    const ready = availability && availability !== "error" ? availability : null;
    const free = ready?.days ?? {};
    const closed = ready?.unavailable ?? {};
    const slotsFor = (key: DateKey) => free[key] ?? [];
    return (
      <div>
        <h2 className="font-display text-display-sm">{copy.changeTitle}</h2>
        <p className="mt-2 text-small text-stone">{copy.changeNote}</p>
        <div className="mt-8">
          {availability === "error" ? (
            <ErrorText>{bookingCopy.datetime.loadError}</ErrorText>
          ) : !ready ? (
            <div className="grid h-80 place-items-center bg-cream">
              <p role="status" className="text-small text-stone">
                {bookingCopy.datetime.loading}
              </p>
            </div>
          ) : (
            <DateTimeStep
              locale={locale}
              copy={bookingCopy}
              month={month}
              onMonthChange={setMonth}
              canGoBack={month > startOfMonth(fromDateKey(ready.first_day))}
              canGoForward={month < startOfMonth(fromDateKey(ready.last_day))}
              date={date}
              onDateChange={(next) => {
                setDate(next);
                if (time && !slotsFor(next).includes(time)) setTime(null);
              }}
              isAvailable={(key) => slotsFor(key).length > 0 || (closed[key]?.length ?? 0) > 0}
              isFull={(key) => slotsFor(key).length === 0}
              slots={date ? slotsFor(date) : []}
              unavailableSlots={date ? (closed[date] ?? []) : []}
              time={time}
              onTimeChange={setTime}
              error={null}
            />
          )}
        </div>
        {error && <ErrorText>{error}</ErrorText>}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => setPanel("none")} className="btn btn-outline">
            {copy.keep}
          </button>
          <button
            type="button"
            disabled={!date || !time || pending}
            onClick={() => date && time && run(() => moveBooking(token, date, time))}
            className="btn btn-primary disabled:opacity-45"
          >
            {pending ? copy.saving : copy.saveChange}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3 sm:flex">
        <button
          type="button"
          onClick={() => {
            setResult({ status: "idle" });
            setPanel("move");
          }}
          className="btn btn-primary"
        >
          {copy.change}
        </button>
        <button
          type="button"
          onClick={() => {
            setResult({ status: "idle" });
            setPanel("cancel");
          }}
          className="btn btn-outline"
        >
          {copy.cancel}
        </button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
