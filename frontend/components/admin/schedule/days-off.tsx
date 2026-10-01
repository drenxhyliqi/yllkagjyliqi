"use client";

import { useActionState, useState, useTransition } from "react";

import { addDayOff, removeDayOff } from "@/app/admin/(panel)/appointments/actions";
import type { FormState } from "@/lib/admin/mutate";
import { FormFooter } from "@/components/admin/form-footer";
import { adminText } from "@/i18n/admin";
import { capitalize } from "@/lib/utils";
import { daysInRange, formatDateRange, weekdayOfKey } from "@/lib/dates";
import type { DayOff } from "@/types/schedule";

const text = adminText.schedule.daysOff;

function AddDayOffForm({ today }: { today: string }) {
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (previous, formData) => {
      const result = await addDayOff(previous, formData);
      if (result.status === "saved") {
        // Start fresh for the next entry.
        setStartsOn("");
        setEndsOn("");
        setFormKey((key) => key + 1);
      }
      return result;
    },
    { status: "idle" },
  );
  const invalid = Boolean(startsOn && endsOn && endsOn < startsOn);

  return (
    <form key={formKey} action={formAction} className="bg-cream/60 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
        <label className="block">
          <span className="text-label text-stone uppercase">{text.from}</span>
          <input
            type="date"
            name="starts_on"
            required
            min={today}
            value={startsOn}
            onChange={(event) => setStartsOn(event.target.value)}
            className="input mt-1.5 bg-paper tabular-nums"
          />
        </label>
        <label className="block">
          <span className="text-label text-stone uppercase">{text.to}</span>
          <input
            type="date"
            name="ends_on"
            min={startsOn || today}
            value={endsOn}
            onChange={(event) => setEndsOn(event.target.value)}
            aria-invalid={invalid || undefined}
            aria-describedby="ends-on-hint"
            className="input mt-1.5 bg-paper tabular-nums"
          />
        </label>
        <p id="ends-on-hint" className="-mt-2 text-small text-stone sm:col-span-2 sm:mt-0">
          {text.toHint}
        </p>
      </div>
      <label className="mt-5 block">
        <span className="text-label text-stone uppercase">{text.note}</span>
        <input
          type="text"
          name="note"
          maxLength={200}
          placeholder={text.notePlaceholder}
          className="input mt-1.5 bg-paper placeholder:text-stone/70"
        />
      </label>
      <FormFooter state={state} pending={pending} disabled={invalid} label={text.add} />
    </form>
  );
}

function DayOffRow({ dayOff }: { dayOff: DayOff }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const count = daysInRange(dayOff.starts_on, dayOff.ends_on);

  const remove = () =>
    startTransition(async () => {
      const result = await removeDayOff(dayOff.id);
      if (result.status === "error") {
        setError(result.message);
        setConfirming(false);
      }
    });

  return (
    <li className="border-b border-line py-4" aria-busy={pending || undefined}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-[1.25rem] leading-snug">
            {formatDateRange(dayOff.starts_on, dayOff.ends_on, "sq")}
          </p>
          <p className="mt-1 text-small text-stone">
            {count === 1
              ? capitalize(weekdayOfKey(dayOff.starts_on, "sq"))
              : text.days(count)}
            {dayOff.note && <> · {dayOff.note}</>}
          </p>
        </div>
        {!confirming && (
          <button
            type="button"
            onClick={() => {
              setError(undefined);
              setConfirming(true);
            }}
            className="-mr-2 min-h-11 shrink-0 cursor-pointer px-2 text-small text-stone underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {text.remove}
          </button>
        )}
      </div>

      {confirming && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-small">{text.confirm}</span>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="btn btn-sm btn-primary grow sm:grow-0"
          >
            {pending ? adminText.common.saving : text.confirmYes}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="btn btn-sm btn-outline grow sm:grow-0"
          >
            {adminText.common.cancel}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-small text-error">
          {error}
        </p>
      )}
    </li>
  );
}

export function DaysOff({ daysOff, today }: { daysOff: DayOff[]; today: string }) {
  return (
    <div className="space-y-8">
      <AddDayOffForm today={today} />
      {daysOff.length > 0 ? (
        <ul className="border-t border-line">
          {daysOff.map((dayOff) => (
            <DayOffRow key={dayOff.id} dayOff={dayOff} />
          ))}
        </ul>
      ) : (
        <p className="border-t border-line pt-6 text-stone">{text.empty}</p>
      )}
    </div>
  );
}
