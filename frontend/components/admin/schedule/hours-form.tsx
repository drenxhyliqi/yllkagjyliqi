"use client";

import { useActionState, useState } from "react";

import { saveHours } from "@/app/admin/(panel)/appointments/actions";
import { FormFooter } from "@/components/admin/form-footer";
import { Switch } from "@/components/admin/switch";
import { adminText } from "@/i18n/admin";
import { weekdayName } from "@/lib/dates";
import type { FormState } from "@/lib/admin/mutate";
import { capitalize, cn } from "@/lib/utils";
import type { DayHours } from "@/types/schedule";

const text = adminText.schedule.hours;
const hhmm = (time: string | null, fallback: string) => (time ? time.slice(0, 5) : fallback);

type DayState = {
  weekday: number;
  open: boolean;
  opens: string;
  closes: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
};

/** What's wrong with a day, if anything. "HH:MM" compares correctly as text. */
function problem(day: DayState): "hours" | "break" | null {
  if (!day.open) return null;
  if (day.opens >= day.closes) return "hours";
  if (
    day.hasBreak &&
    (day.breakStart >= day.breakEnd || day.breakStart < day.opens || day.breakEnd > day.closes)
  )
    return "break";
  return null;
}

function TimeInput({
  label,
  name,
  value,
  invalid,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  invalid: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-label text-stone uppercase">{label}</span>
      <input
        type="time"
        name={name}
        value={value}
        step={300}
        required
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        className="input mt-1.5 tabular-nums"
      />
    </label>
  );
}

export function HoursForm({ hours }: { hours: DayHours[] }) {
  const [days, setDays] = useState<DayState[]>(() =>
    hours.map((day) => ({
      weekday: day.weekday,
      open: day.is_open,
      opens: hhmm(day.opens_at, "09:00"),
      closes: hhmm(day.closes_at, "18:00"),
      hasBreak: Boolean(day.break_starts_at),
      breakStart: hhmm(day.break_starts_at, "12:00"),
      breakEnd: hhmm(day.break_ends_at, "13:00"),
    })),
  );
  const [copiedFrom, setCopiedFrom] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveHours, {
    status: "idle",
  });

  const update = (weekday: number, change: Partial<DayState>) => {
    setCopiedFrom(null);
    setDays((current) =>
      current.map((day) => (day.weekday === weekday ? { ...day, ...change } : day)),
    );
  };

  const copyToOthers = (source: DayState) => {
    setDays((current) =>
      current.map((day) =>
        day.open && day.weekday !== source.weekday
          ? { ...source, weekday: day.weekday, open: true }
          : day,
      ),
    );
    setCopiedFrom(source.weekday);
  };

  const invalid = days.some((day) => problem(day) !== null);
  const openDays = days.filter((day) => day.open).length;

  return (
    <form action={formAction}>
      <ul className="border-t border-line">
        {days.map((day) => {
          const issue = problem(day);
          const label = capitalize(weekdayName(day.weekday, "sq"));
          return (
            <li key={day.weekday} className="border-b border-line py-4">
              <div className="flex min-h-11 items-center justify-between gap-4">
                <span className="font-display text-[1.25rem]">{label}</span>
                <div className="flex items-center gap-3">
                  <span className={cn("text-small", day.open ? "text-ink" : "text-stone")}>
                    {day.open ? text.open : text.closed}
                  </span>
                  <Switch
                    name={`open_${day.weekday}`}
                    checked={day.open}
                    onChange={(open) => update(day.weekday, { open })}
                    label={label}
                  />
                </div>
              </div>

              {day.open && (
                <div className="mt-3 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <TimeInput
                      label={text.from}
                      name={`opens_${day.weekday}`}
                      value={day.opens}
                      invalid={issue === "hours"}
                      onChange={(opens) => update(day.weekday, { opens })}
                    />
                    <TimeInput
                      label={text.to}
                      name={`closes_${day.weekday}`}
                      value={day.closes}
                      invalid={issue === "hours"}
                      onChange={(closes) => update(day.weekday, { closes })}
                    />
                  </div>

                  {day.hasBreak ? (
                    <div className="border-l border-ink/30 pl-3">
                      <div className="grid grid-cols-2 gap-3">
                        <TimeInput
                          label={text.breakFrom}
                          name={`break_start_${day.weekday}`}
                          value={day.breakStart}
                          invalid={issue === "break"}
                          onChange={(breakStart) => update(day.weekday, { breakStart })}
                        />
                        <TimeInput
                          label={text.breakTo}
                          name={`break_end_${day.weekday}`}
                          value={day.breakEnd}
                          invalid={issue === "break"}
                          onChange={(breakEnd) => update(day.weekday, { breakEnd })}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => update(day.weekday, { hasBreak: false })}
                        className="mt-1 min-h-11 cursor-pointer text-small text-stone underline-offset-4 hover:text-ink hover:underline"
                      >
                        {text.removeBreak}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => update(day.weekday, { hasBreak: true })}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-small text-stone transition-colors hover:text-ink"
                    >
                      <span aria-hidden="true" className="text-lead leading-none">
                        +
                      </span>
                      {text.addBreak}
                      <span className="sr-only">: {label}</span>
                    </button>
                  )}

                  {issue && (
                    <p role="alert" className="text-small text-error">
                      {issue === "hours" ? text.invalid : text.breakInvalid}
                    </p>
                  )}

                  {openDays > 1 && !issue && (
                    <div>
                      <button
                        type="button"
                        onClick={() => copyToOthers(day)}
                        className="min-h-11 cursor-pointer text-small underline underline-offset-4"
                      >
                        {text.copyToOthers}
                      </button>
                      {copiedFrom === day.weekday && (
                        <p role="status" className="text-small text-stone">
                          {text.copied}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-small text-stone">{text.breakHint}</p>

      <FormFooter state={state} pending={pending} disabled={invalid} label={text.save} />
    </form>
  );
}
