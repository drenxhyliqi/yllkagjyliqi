"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { BookingResult } from "@/app/[locale]/book/actions";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { DateKey } from "@/lib/booking/availability";
import type { UnavailableTime } from "@/types/booking";
import {
  ADDRESS_MAX_LENGTH,
  type BookingErrorKey,
  type ContactDetails,
  type DetailsField,
} from "@/lib/booking/validation";
import { formatDuration, formatLongDate, formatPrice } from "@/lib/format";
import {
  MAX_PEOPLE,
  MAX_SERVICES,
  itemLabel,
  totalMinutes,
  totalPrice,
  type Chosen,
  type ChosenService,
} from "@/lib/booking/selection";
import type { BookingOptions } from "@/lib/data/booking-options";
import { capitalize, cn } from "@/lib/utils";
import type { CategoryWithServices } from "@/types/service";

export type Location = "studio" | "client";

type Copy = Dictionary["bookingPage"];
type Pricing = Dictionary["pricing"];

/** Shared error line under a step or field. */
export function ErrorText({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <p id={id} role="alert" className="mt-3 text-small text-error">
      {children}
    </p>
  );
}

/* ——— 1. Service ——— */

type ServiceStepProps = {
  catalog: CategoryWithServices[];
  categorySlug: string;
  onCategoryChange: (slug: string) => void;
  chosen: Chosen[];
  onToggle: (slug: string) => void;
  onQuantity: (slug: string, quantity: number) => void;
  location: Location;
  onLocationChange: (location: Location) => void;
  options: BookingOptions;
  locale: Locale;
  copy: Copy;
  pricing: Pricing;
  contactHref: string;
  error: BookingErrorKey | null;
};

export function ServiceStep({
  catalog,
  categorySlug,
  onCategoryChange,
  chosen,
  onToggle,
  onQuantity,
  location,
  onLocationChange,
  options,
  locale,
  copy,
  pricing,
  contactHref,
  error,
}: ServiceStepProps) {
  const category =
    catalog.find((entry) => entry.slug === categorySlug) ?? catalog[0];
  const quantityOf = (slug: string) =>
    chosen.find((entry) => entry.slug === slug)?.quantity ?? 0;
  const full = chosen.length >= MAX_SERVICES;

  return (
    <div>
      <p className="mb-6 text-small text-stone">{copy.service.hint}</p>
      <div
        role="group"
        aria-label={copy.service.categories}
        className="flex flex-wrap gap-x-6 gap-y-3 border-b border-line pb-5 sm:gap-x-8"
      >
        {catalog.map((entry) => {
          const count = entry.services.filter((service) => quantityOf(service.slug) > 0).length;
          return (
            <button
              key={entry.slug}
              type="button"
              aria-pressed={entry.slug === category.slug}
              onClick={() => onCategoryChange(entry.slug)}
              className="link-line cursor-pointer text-label uppercase opacity-55 transition-opacity duration-300 [--line-trim:0.16em] hover:opacity-100 aria-pressed:opacity-100 aria-pressed:[background-size:calc(100%-0.16em)_1px]"
            >
              {entry.name}
              {count > 0 && (
                <span className="ml-1.5 inline-grid size-4 place-items-center rounded-full bg-ink align-[0.1em] text-[0.5625rem] tracking-normal text-paper">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <fieldset className="mt-8">
        <legend className="sr-only">{category.name}</legend>
        <div className="space-y-3">
          {category.services.map((service) => {
            const quantity = quantityOf(service.slug);
            const selected = quantity > 0;
            return (
              <div
                key={service.id}
                className={cn(
                  "border transition-colors duration-300",
                  selected ? "border-ink bg-cream" : "border-line hover:border-ink/40",
                )}
              >
                <label className="flex cursor-pointer items-start gap-5 p-5 has-focus-visible:outline has-focus-visible:outline-offset-2 has-focus-visible:outline-ink sm:p-6">
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={!selected && full}
                    onChange={() => onToggle(service.slug)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="mt-1.5 grid size-4 shrink-0 place-items-center border border-ink/40 peer-checked:border-ink peer-checked:bg-ink peer-checked:[&>svg]:opacity-100"
                  >
                    <svg viewBox="0 0 12 12" className="size-3 text-paper opacity-0" fill="none" stroke="currentColor" strokeWidth={1.75}>
                      <path d="m2.5 6.25 2.25 2.25 4.75-5" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <span className="font-display text-[1.375rem] leading-snug">
                        {service.name}
                      </span>
                      <span className="font-display text-[1.25rem] whitespace-nowrap lining-nums">
                        {formatPrice(service, locale, pricing)}
                      </span>
                    </span>
                    {service.description && (
                      <span className="mt-1.5 block text-small text-stone">
                        {service.description}
                      </span>
                    )}
                    {service.durationMinutes !== null && (
                      <span className="eyebrow mt-3 block text-stone">
                        {formatDuration(service.durationMinutes, pricing)}
                      </span>
                    )}
                  </span>
                </label>

                {selected && (
                  <div className="flex items-center justify-between gap-4 border-t border-ink/15 px-5 py-3 sm:px-6">
                    <span className="text-small text-stone">{copy.service.people}</span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        aria-label={`${copy.service.fewer}: ${service.name}`}
                        disabled={quantity <= 1}
                        onClick={() => onQuantity(service.slug, quantity - 1)}
                        className="grid size-11 cursor-pointer place-items-center border border-ink/30 bg-paper text-lead leading-none disabled:cursor-default disabled:opacity-35"
                      >
                        −
                      </button>
                      <output
                        aria-live="polite"
                        className="w-10 text-center font-display text-[1.25rem] tabular-nums"
                      >
                        {quantity}
                      </output>
                      <button
                        type="button"
                        aria-label={`${copy.service.more}: ${service.name}`}
                        disabled={quantity >= MAX_PEOPLE}
                        onClick={() => onQuantity(service.slug, quantity + 1)}
                        className="grid size-11 cursor-pointer place-items-center border border-ink/30 bg-paper text-lead leading-none disabled:cursor-default disabled:opacity-35"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {full && <p className="mt-3 text-small text-stone">{copy.service.limit}</p>}
      </fieldset>

      {error && <ErrorText>{copy.errors[error]}</ErrorText>}

      {options.homeVisits && (
        <fieldset className="mt-10">
          <legend className="eyebrow text-stone">{copy.service.place}</legend>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(["studio", "client"] as const).map((place) => (
              <label
                key={place}
                className="flex min-h-14 cursor-pointer flex-col justify-center border border-line px-4 py-3 transition-colors hover:border-ink/40 has-checked:border-ink has-checked:bg-cream has-focus-visible:outline has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
              >
                <input
                  type="radio"
                  name="location"
                  value={place}
                  checked={location === place}
                  onChange={() => onLocationChange(place)}
                  className="sr-only"
                />
                <span>{copy.service[place]}</span>
                {place === "client" && (
                  <span className="mt-0.5 text-small text-stone">{copy.service.clientHint}</span>
                )}
              </label>
            ))}
          </div>
          {location === "client" && options.homeVisitNote && (
            <p className="mt-3 text-small text-stone">{options.homeVisitNote}</p>
          )}
        </fieldset>
      )}

      <p className="mt-8 text-small text-stone">
        {copy.service.otherNote}{" "}
        <Link
          href={contactHref}
          className="link-line text-ink [background-size:100%_1px]"
        >
          {copy.service.otherLink}
        </Link>
      </p>
    </div>
  );
}

/* ——— 2. Date & time ——— */

type DateTimeStepProps = {
  locale: Locale;
  copy: Copy;
  month: Date;
  onMonthChange: (month: Date) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  date: DateKey | null;
  onDateChange: (date: DateKey) => void;
  isAvailable: (date: DateKey) => boolean;
  isFull: (date: DateKey) => boolean;
  /** Times that can be booked. */
  slots: string[];
  /** The day's other times, shown greyed out with why. */
  unavailableSlots: UnavailableTime[];
  time: string | null;
  onTimeChange: (time: string) => void;
  error: BookingErrorKey | null;
};

export function DateTimeStep({
  locale,
  copy,
  month,
  onMonthChange,
  canGoBack,
  canGoForward,
  date,
  onDateChange,
  isAvailable,
  isFull,
  slots,
  unavailableSlots,
  time,
  onTimeChange,
  error,
}: DateTimeStepProps) {
  // "HH:MM" sorts correctly as text.
  const grid = [
    ...slots.map((slot) => ({ slot, reason: null })),
    ...unavailableSlots.map(({ time: slot, reason }) => ({ slot, reason })),
  ].sort((a, b) => a.slot.localeCompare(b.slot));
  const tag = {
    booked: copy.datetime.booked,
    break: copy.datetime.onBreak,
    notice: null,
  } as const;
  const anyBooked = unavailableSlots.some((entry) => entry.reason === "booked");
  return (
    <div className="grid gap-12 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] sm:gap-10">
      <BookingCalendar
        locale={locale}
        month={month}
        onMonthChange={onMonthChange}
        selected={date}
        onSelect={onDateChange}
        isAvailable={isAvailable}
        isFull={isFull}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        labels={copy.datetime}
      />

      <fieldset>
        <legend className="eyebrow text-stone">{copy.datetime.times}</legend>
        {date && (
          <p className="mt-3 font-display text-[1.25rem]">
            {capitalize(formatLongDate(date, locale))}
          </p>
        )}
        {!date ? (
          <p className="mt-4 text-small text-stone">{copy.datetime.pickDate}</p>
        ) : grid.length === 0 ? (
          <p className="mt-4 text-small text-stone">{copy.datetime.noTimes}</p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {grid.map(({ slot, reason }) =>
                reason === null ? (
                  <label
                    key={slot}
                    className="grid h-14 cursor-pointer place-items-center border border-line text-small tabular-nums transition-colors duration-200 hover:border-ink/40 has-checked:border-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                  >
                    <input
                      type="radio"
                      name="time"
                      value={slot}
                      checked={slot === time}
                      onChange={() => onTimeChange(slot)}
                      className="sr-only"
                    />
                    {slot}
                  </label>
                ) : (
                  <span
                    key={slot}
                    aria-disabled="true"
                    className="flex h-14 cursor-not-allowed flex-col items-center justify-center gap-0.5 border border-line/60 bg-cream/70 text-small tabular-nums"
                  >
                    <span className="text-stone/45 line-through decoration-stone/40">
                      {slot}
                    </span>
                    {tag[reason] ? (
                      <span className="text-[0.625rem] leading-none tracking-[0.14em] text-stone uppercase">
                        {tag[reason]}
                      </span>
                    ) : (
                      <span className="sr-only">{copy.datetime.taken}</span>
                    )}
                  </span>
                ),
              )}
            </div>
            {slots.length === 0 && (
              <p className="mt-4 text-small text-stone">{copy.datetime.dayFull}</p>
            )}
            {slots.length > 0 && anyBooked && (
              <p className="mt-4 flex items-center gap-2 text-small text-stone">
                <span
                  aria-hidden="true"
                  className="inline-block h-3 w-5 border border-line/60 bg-cream/60"
                />
                {copy.datetime.takenLegend}
              </p>
            )}
          </>
        )}
        {error && <ErrorText>{copy.errors[error]}</ErrorText>}
      </fieldset>
    </div>
  );
}

/* ——— 3. Details ——— */

type DetailsStepProps = {
  copy: Copy;
  /** Ask where the appointment is (visits at the client's place). */
  needsAddress: boolean;
  details: ContactDetails;
  onChange: (details: ContactDetails) => void;
  errors: Partial<Record<DetailsField, BookingErrorKey>>;
};

export function DetailsStep({
  copy,
  needsAddress,
  details,
  onChange,
  errors,
}: DetailsStepProps) {
  const field = (
    key: Exclude<DetailsField, "address">,
    type: string,
    autoComplete: string,
    extra: Record<string, string> = {},
  ) => {
    const errorId = `${key}-error`;
    const error = errors[key];
    return (
      <div>
        <label htmlFor={key} className="text-label text-stone uppercase">
          {copy.details[key]}
        </label>
        <input
          id={key}
          type={type}
          autoComplete={autoComplete}
          value={details[key]}
          onChange={(event) =>
            onChange({ ...details, [key]: event.target.value })
          }
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="input mt-2"
          {...extra}
        />
        {error && <ErrorText id={errorId}>{copy.errors[error]}</ErrorText>}
      </div>
    );
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="sm:col-span-2">{field("name", "text", "name")}</div>
      {field("phone", "tel", "tel", { inputMode: "tel" })}
      {field("email", "email", "email", {
        inputMode: "email",
        spellCheck: "false",
      })}
      {needsAddress && (
        <div className="sm:col-span-2">
          <label htmlFor="address" className="text-label text-stone uppercase">
            {copy.details.address}
          </label>
          <input
            id="address"
            type="text"
            autoComplete="street-address"
            maxLength={ADDRESS_MAX_LENGTH}
            value={details.address}
            placeholder={copy.details.addressPlaceholder}
            onChange={(event) => onChange({ ...details, address: event.target.value })}
            aria-invalid={errors.address ? true : undefined}
            aria-describedby={errors.address ? "address-error" : undefined}
            className="input mt-2 placeholder:text-stone/70"
          />
          {errors.address && (
            <ErrorText id="address-error">{copy.errors[errors.address]}</ErrorText>
          )}
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor="note" className="text-label text-stone uppercase">
          {copy.details.note}{" "}
          <span className="normal-case tracking-normal">
            ({copy.details.optional})
          </span>
        </label>
        <textarea
          id="note"
          rows={4}
          maxLength={1000}
          value={details.note}
          placeholder={copy.details.notePlaceholder}
          onChange={(event) =>
            onChange({ ...details, note: event.target.value })
          }
          className="input mt-2 resize-y placeholder:text-stone/70"
        />
      </div>
    </div>
  );
}

/* ——— 4. Review ——— */

type ReviewStepProps = {
  locale: Locale;
  copy: Copy;
  pricing: Pricing;
  items: ChosenService[];
  location: Location;
  options: BookingOptions;
  date: DateKey;
  time: string;
  details: ContactDetails;
  privacyHref: string;
  formAction: (formData: FormData) => void;
  pending: boolean;
  result: BookingResult;
  onEdit: (step: number) => void;
};

export function ReviewStep({
  locale,
  copy,
  pricing,
  items,
  location,
  options,
  date,
  time,
  details,
  privacyHref,
  formAction,
  pending,
  result,
  onEdit,
}: ReviewStepProps) {
  const errors = result.status === "error" ? result.fields : {};
  const minutes = totalMinutes(items);
  const rows: { label: string; value: string; step: number }[] = [
    { label: copy.review.service, value: items.map(itemLabel).join(", "), step: 0 },
    ...(options.homeVisits
      ? [
          {
            label: copy.review.place,
            value:
              location === "client"
                ? `${copy.service.client}: ${details.address.trim()}`
                : copy.service.studio,
            step: location === "client" ? 2 : 0,
          },
        ]
      : []),
    {
      label: copy.review.date,
      value: capitalize(formatLongDate(date, locale)),
      step: 1,
    },
    { label: copy.review.time, value: time, step: 1 },
    {
      label: copy.review.duration,
      value: minutes ? formatDuration(minutes, pricing) : "",
      step: 0,
    },
    {
      label: copy.review.price,
      value: totalPrice(items, locale, pricing),
      step: 0,
    },
    {
      label: copy.review.contact,
      value: [details.name, details.phone, details.email].join(" · "),
      step: 2,
    },
  ];
  // Problems found by the server are shown where the visitor can fix them.
  const stepErrors = [
    errors.service && { step: 0, key: errors.service },
    errors.slot && { step: 1, key: errors.slot },
    (errors.name || errors.phone || errors.email || errors.address) && {
      step: 2,
      key: errors.name ?? errors.phone ?? errors.email ?? errors.address,
    },
  ].filter(Boolean) as { step: number; key: BookingErrorKey }[];

  return (
    <form action={formAction}>
      <input type="hidden" name="locale" value={locale} />
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map(({ service, quantity }) => ({ slug: service.slug, quantity })))}
      />
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="address" value={location === "client" ? details.address : ""} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="name" value={details.name} />
      <input type="hidden" name="phone" value={details.phone} />
      <input type="hidden" name="email" value={details.email} />
      <input type="hidden" name="note" value={details.note} />

      <dl className="border-t border-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-6 border-b border-line py-4"
          >
            <dt className="eyebrow w-28 shrink-0 text-stone">{row.label}</dt>
            <dd className="min-w-0 flex-1 text-right font-display text-[1.1875rem] break-words lining-nums">
              {row.value}
            </dd>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="link-line shrink-0 cursor-pointer text-[0.6875rem] tracking-[0.16em] text-stone uppercase hover:text-ink"
            >
              {copy.actions.change}
            </button>
          </div>
        ))}
      </dl>

      {details.note && (
        <p className="mt-5 text-small whitespace-pre-line text-stone">
          “{details.note}”
        </p>
      )}

      <div className="mt-8 bg-cream/70 p-5 text-small">
        <p className="eyebrow text-stone">{copy.review.policy}</p>
        <p className="mt-2">
          {options.cancellationHours > 0
            ? copy.review.deadline.replace("{hours}", String(options.cancellationHours))
            : copy.review.deadlineAnytime}
        </p>
        {options.policy && (
          <p className="mt-2 whitespace-pre-line text-stone">{options.policy}</p>
        )}
      </div>

      {errors.form && <ErrorText>{copy.errors[errors.form]}</ErrorText>}

      {stepErrors.map(({ step, key }) => (
        <ErrorText key={step}>
          {copy.errors[key]}{" "}
          <button
            type="button"
            onClick={() => onEdit(step)}
            className="link-line cursor-pointer text-ink [background-size:100%_1px]"
          >
            {copy.actions.change}
          </button>
        </ErrorText>
      ))}

      <label className="mt-8 flex cursor-pointer items-start gap-4">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={errors.consent ? true : undefined}
          className="mt-1 size-4 shrink-0 cursor-pointer accent-ink"
        />
        <span className="text-small text-stone">
          {copy.review.consent}{" "}
          <Link
            href={privacyHref}
            className="link-line text-ink [background-size:100%_1px]"
          >
            {copy.review.consentLink}
          </Link>
          .
        </span>
      </label>
      {errors.consent && <ErrorText>{copy.errors.consent}</ErrorText>}

      <p className="mt-6 text-small text-stone">{copy.review.note}</p>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => onEdit(2)}
          className="btn btn-outline"
        >
          {copy.actions.back}
        </button>
        <button
          type="submit"
          disabled={pending}
          className={cn("btn btn-primary")}
        >
          {pending ? copy.actions.submitting : copy.actions.submit}
        </button>
      </div>
    </form>
  );
}
