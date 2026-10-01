"use client";

import { useActionState, useState } from "react";

import { createBooking } from "@/app/admin/(panel)/bookings/actions";
import { SelectField, TextAreaField, TextField } from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { ChevronDownIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { durationLabel } from "@/lib/admin/format";
import type { FormState } from "@/lib/admin/mutate";
import { cn } from "@/lib/utils";

const text = adminText.bookings.form;
const DURATIONS = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 300, 360, 420, 480, 600, 720];
const MAX_ITEMS = 6;
const MAX_PEOPLE = 10;

export type ServiceChoice = { id: string; label: string; duration: number | null };
type Row = { key: number; serviceId: string; quantity: number };

let nextKey = 0;

export function NewBookingForm({
  services,
  today,
  homeVisits,
}: {
  services: ServiceChoice[];
  today: string;
  /** Visits at the client's place are offered (Terminet). */
  homeVisits: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createBooking, {
    status: "idle",
  });
  const [rows, setRows] = useState<Row[]>(() => [{ key: nextKey++, serviceId: services[0]?.id ?? "", quantity: 1 }]);
  const [duration, setDuration] = useState<number | null>(null);
  const [location, setLocation] = useState<"studio" | "client">("studio");

  const computed =
    rows.reduce((sum, row) => sum + (services.find((s) => s.id === row.serviceId)?.duration ?? 0) * row.quantity, 0) ||
    60;
  const shown = duration ?? computed;
  const durations = DURATIONS.includes(shown) ? DURATIONS : [...DURATIONS, shown].sort((a, b) => a - b);
  const errorFor = (field: string) =>
    state.status === "error" && state.field === field ? state.message : undefined;

  const update = (key: number, change: Partial<Row>) => {
    setDuration(null);
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...change } : row)));
  };
  const used = new Set(rows.map((row) => row.serviceId));

  return (
    <form action={formAction} className="space-y-6">
      <fieldset>
        <legend className="text-label text-stone uppercase">{text.service}</legend>
        <ul className="mt-1.5 space-y-3">
          {rows.map((row) => (
            <li key={row.key} className="border border-line p-3">
              <div className="relative">
                <select
                  name="service_id"
                  value={row.serviceId}
                  aria-label={text.service}
                  onChange={(event) => update(row.key, { serviceId: event.target.value })}
                  className="input cursor-pointer appearance-none pr-11"
                >
                  {services.map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                      disabled={service.id !== row.serviceId && used.has(service.id)}
                    >
                      {service.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
              </div>
              <input type="hidden" name="quantity" value={row.quantity} />
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-small text-stone">{text.people}</span>
                <div className="flex items-center gap-3">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDuration(null);
                        setRows((current) => current.filter((other) => other.key !== row.key));
                      }}
                      className="min-h-11 cursor-pointer px-1 text-small text-stone underline-offset-4 hover:underline"
                    >
                      {text.removeService}
                    </button>
                  )}
                  <div className="flex items-center">
                    <button
                      type="button"
                      aria-label="−"
                      disabled={row.quantity <= 1}
                      onClick={() => update(row.key, { quantity: row.quantity - 1 })}
                      className="grid size-11 cursor-pointer place-items-center border border-ink/30 disabled:opacity-35"
                    >
                      −
                    </button>
                    <output className="w-9 text-center tabular-nums">{row.quantity}</output>
                    <button
                      type="button"
                      aria-label="+"
                      disabled={row.quantity >= MAX_PEOPLE}
                      onClick={() => update(row.key, { quantity: row.quantity + 1 })}
                      className="grid size-11 cursor-pointer place-items-center border border-ink/30 disabled:opacity-35"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {rows.length < Math.min(MAX_ITEMS, services.length) && (
          <button
            type="button"
            onClick={() => {
              const free = services.find((service) => !used.has(service.id));
              if (!free) return;
              setDuration(null);
              setRows((current) => [...current, { key: nextKey++, serviceId: free.id, quantity: 1 }]);
            }}
            className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-small text-stone hover:text-ink"
          >
            <span aria-hidden="true" className="text-lead leading-none">
              +
            </span>
            {text.addService}
          </button>
        )}
      </fieldset>

      <div className="grid grid-cols-1 gap-6 min-[400px]:grid-cols-2 min-[400px]:gap-3">
        <TextField label={text.date} name="date" type="date" defaultValue={today} required error={errorFor("date")} />
        <TextField label={text.time} name="time" type="time" step={300} defaultValue="10:00" required error={errorFor("time")} />
      </div>
      <SelectField
        label={text.duration}
        name="duration_minutes"
        value={String(shown)}
        hint={text.durationHint}
        onChange={(event) => setDuration(Number(event.target.value))}
        options={durations.map((m) => ({ value: String(m), label: durationLabel(m) }))}
      />

      {homeVisits && (
        <fieldset>
          <legend className="text-label text-stone uppercase">{text.place}</legend>
          <div className="mt-1.5 grid grid-cols-2 border border-ink/28">
            {(["studio", "client"] as const).map((place) => (
              <label
                key={place}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center justify-center text-small not-first:border-l not-first:border-ink/28",
                  "has-checked:bg-ink has-checked:text-paper has-focus-visible:outline has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                )}
              >
                <input
                  type="radio"
                  name="location"
                  value={place}
                  checked={location === place}
                  onChange={() => setLocation(place)}
                  className="sr-only"
                />
                {place === "studio" ? text.studio : text.atClient}
              </label>
            ))}
          </div>
          {location === "client" && (
            <TextField
              className="mt-4"
              label={text.address}
              name="address"
              required
              maxLength={300}
              hint={text.addressHint}
              error={errorFor("address")}
            />
          )}
        </fieldset>
      )}

      <div className="space-y-5 border-t border-line pt-6">
        <TextField label={text.name} name="customer_name" required maxLength={120} autoComplete="off" error={errorFor("customer_name")} />
        <TextField label={text.phone} name="customer_phone" type="tel" required maxLength={40} autoComplete="off" error={errorFor("customer_phone")} />
        <TextField
          label={text.email}
          name="customer_email"
          type="email"
          optional
          maxLength={254}
          autoComplete="off"
          autoCapitalize="none"
          error={errorFor("customer_email")}
        />
        <TextAreaField label={text.note} name="customer_note" optional maxLength={1000} />
        <SelectField
          label={text.language}
          name="locale"
          defaultValue="sq"
          options={[
            { value: "sq", label: text.albanian },
            { value: "en", label: text.english },
          ]}
        />
      </div>

      <FormFooter state={state} pending={pending} label={text.save} />
    </form>
  );
}
