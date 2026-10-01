"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  requestAppointment,
  type BookingResult,
} from "@/app/[locale]/book/actions";
import {
  DateTimeStep,
  DetailsStep,
  ErrorText,
  ReviewStep,
  ServiceStep,
  type Location,
} from "@/components/booking/booking-steps";
import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fromDateKey, type DateKey } from "@/lib/booking/availability";
import {
  itemLabel,
  itemsParam,
  resolveChosen,
  totalMinutes,
  totalPrice,
  type Chosen,
  type ChosenService,
} from "@/lib/booking/selection";
import type { BookingOptions } from "@/lib/data/booking-options";
import {
  validateDetails,
  type BookingErrorKey,
  type ContactDetails,
  type DetailsField,
} from "@/lib/booking/validation";
import { formatDuration, formatLongDate } from "@/lib/format";
import { capitalize, cn } from "@/lib/utils";
import type { Availability } from "@/types/booking";
import type { CategoryWithServices } from "@/types/service";

type Copy = Dictionary["bookingPage"];

export type BookingWizardProps = {
  locale: Locale;
  /** Bookable services only (those with a duration), grouped by category. */
  catalog: CategoryWithServices[];
  initialService: string | null;
  /** Visits, cancellation policy: as Yllka set them. */
  options: BookingOptions;
  copy: Copy;
  pricing: Dictionary["pricing"];
  links: { contact: string; privacy: string; home: string };
};

const STEP_KEYS = ["service", "datetime", "details", "review"] as const;
const EMPTY_DETAILS: ContactDetails = {
  name: "",
  phone: "",
  email: "",
  note: "",
  address: "",
};

// Availability depends on "now", so the calendar only renders in the browser.
const noop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

type Loaded = { key: string; data: Availability | null };

/**
 * Times for the chosen services, from the server (which knows about other
 * bookings, breaks and days off). `key` changes to load them again.
 */
function useAvailability(query: string | null, key: string) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    fetch(`/api/availability?${query}`)
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null)
      .then((data: Availability | null) => {
        if (!cancelled) setLoaded({ key, data });
      });
    return () => {
      cancelled = true;
    };
  }, [query, key]);

  if (!query || loaded?.key !== key) return { status: "loading" as const };
  return loaded.data
    ? { status: "ready" as const, data: loaded.data }
    : { status: "error" as const };
}

/** Remounts the wizard for "book another appointment". */
export function BookingWizard(props: BookingWizardProps) {
  const [round, setRound] = useState(0);
  // No bookable services (none set up yet, or the server is unreachable).
  if (props.catalog.length === 0) {
    return (
      <div className="container-site pb-24 lg:pb-32">
        <div className="max-w-xl border-t border-ink pt-10">
          <h2 className="font-display text-display-md">{props.copy.unavailableTitle}</h2>
          <p className="mt-4 text-stone">{props.copy.unavailableText}</p>
          <Link href={props.links.contact} className="btn btn-primary mt-8">
            {props.copy.unavailableLink}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <Wizard
      key={round}
      {...props}
      onRestart={() => setRound((value) => value + 1)}
    />
  );
}

function Wizard({
  locale,
  catalog,
  initialService,
  options,
  copy,
  pricing,
  links,
  onRestart,
}: BookingWizardProps & { onRestart: () => void }) {
  const isClient = useIsClient();
  const services = catalog.flatMap((category) => category.services);
  const preselected = services.find(
    (service) => service.slug === initialService,
  );

  const [step, setStep] = useState(0);
  const [categorySlug, setCategorySlug] = useState(
    catalog.find((category) =>
      category.services.some((service) => service === preselected),
    )?.slug ?? catalog[0]?.slug,
  );
  const [chosen, setChosen] = useState<Chosen[]>(
    preselected ? [{ slug: preselected.slug, quantity: 1 }] : [],
  );
  const [location, setLocation] = useState<Location>("studio");
  const [date, setDate] = useState<DateKey | null>(null);
  const [time, setTime] = useState<string | null>(null);
  // Read the clock once, when the wizard opens.
  const [now] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(now));
  const [details, setDetails] = useState<ContactDetails>(EMPTY_DETAILS);
  const [stepError, setStepError] = useState<BookingErrorKey | null>(null);
  const [detailErrors, setDetailErrors] = useState<
    Partial<Record<DetailsField, BookingErrorKey>>
  >({});
  // Bumped to reload the free times, e.g. after a time was just taken.
  const [reloads, setReloads] = useState(0);
  const [result, formAction, pending] = useActionState<BookingResult, FormData>(
    async (previous, formData) => {
      const next = await requestAppointment(previous, formData);
      if (next.status === "error" && next.fields.slot === "slotTaken") {
        setTime(null);
        setReloads((count) => count + 1);
      }
      return next;
    },
    { status: "idle" },
  );

  const items = resolveChosen(chosen, services);
  const query = items.length
    ? `items=${encodeURIComponent(itemsParam(items))}&location=${location}`
    : null;
  const availability = useAvailability(step >= 1 ? query : null, `${query}:${reloads}`);
  const freeTimes =
    availability.status === "ready" ? availability.data.days : {};
  const closedTimes =
    availability.status === "ready" ? availability.data.unavailable : {};
  const slotsFor = (key: DateKey) => freeTimes[key] ?? [];
  const hasHours = (key: DateKey) =>
    slotsFor(key).length > 0 || (closedTimes[key]?.length ?? 0) > 0;
  const slots = date ? slotsFor(date) : [];
  const unavailableSlots = date ? (closedTimes[date] ?? []) : [];

  const firstMonth =
    availability.status === "ready"
      ? startOfMonth(fromDateKey(availability.data.first_day))
      : startOfMonth(now);
  const lastMonth =
    availability.status === "ready"
      ? startOfMonth(fromDateKey(availability.data.last_day))
      : startOfMonth(now);

  // Move focus and the view to the new step, for keyboard and screen-reader users too.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const received = result.status === "received";
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    topRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [step, received]);

  const goTo = (next: number) => {
    setStepError(null);
    setStep(next);
  };

  // Other services or another place take a different length of time:
  // the time is chosen again.
  const changeChoice = (update: (current: Chosen[]) => Chosen[]) => {
    setChosen(update);
    setTime(null);
    setStepError(null);
  };
  const toggleService = (slug: string) =>
    changeChoice((current) =>
      current.some((entry) => entry.slug === slug)
        ? current.filter((entry) => entry.slug !== slug)
        : [...current, { slug, quantity: 1 }],
    );
  const setQuantity = (slug: string, quantity: number) =>
    changeChoice((current) =>
      current.map((entry) => (entry.slug === slug ? { ...entry, quantity } : entry)),
    );
  const changeLocation = (next: Location) => {
    setLocation(next);
    setTime(null);
  };

  const proceed = () => {
    if (step === 0 && items.length === 0) return setStepError("service");
    if (step === 1 && (!date || !time)) return setStepError("slot");
    if (step === 2) {
      const errors = validateDetails(details, location === "client");
      setDetailErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    goTo(step + 1);
  };

  if (received) {
    return (
      <div ref={topRef} className="container-site scroll-mt-28 pb-24 lg:pb-32">
        <div className="max-w-2xl border-t border-ink pt-10">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-display-lg outline-none"
          >
            {copy.success.title} <em>{result.name.split(" ")[0]}.</em>
          </h2>
          <p className="mt-6 text-lead text-stone">{copy.success.text}</p>
          <p className="mt-6 text-small text-stone">
            {copy.success.reference}:{" "}
            <span className="font-medium tracking-[0.12em] text-ink">
              {result.reference}
            </span>
          </p>
          {items.length > 0 && date && time && (
            <p className="mt-8 font-display text-display-sm">
              {items.map(itemLabel).join(", ")}
              <span className="mt-1 block text-lead text-stone">
                {capitalize(formatLongDate(date, locale))}, {time}
              </span>
            </p>
          )}
          <ManageLink
            href={localizePath(locale, `/booking/${result.manageToken}`)}
            copy={copy}
          />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={links.home} className="btn btn-primary">
              {copy.success.home}
            </Link>
            <button
              type="button"
              onClick={onRestart}
              className="btn btn-outline"
            >
              {copy.success.another}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const summary = (compact: boolean) => (
    <Summary
      compact={compact}
      copy={copy}
      locale={locale}
      pricing={pricing}
      items={items}
      date={date}
      time={time}
    />
  );

  return (
    <div ref={topRef} className="container-site scroll-mt-28 pb-24 lg:pb-32">
      <Progress copy={copy} step={step} onStepClick={goTo} />

      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-8">
        <div className="min-w-0 lg:col-span-7">
          {step > 0 && <div className="mb-8 lg:hidden">{summary(true)}</div>}

          <h2
            ref={headingRef}
            tabIndex={-1}
            className="mb-8 font-display text-display-md outline-none"
          >
            {copy[STEP_KEYS[step]].title}
          </h2>

          {step === 0 && (
            <ServiceStep
              catalog={catalog}
              categorySlug={categorySlug}
              onCategoryChange={setCategorySlug}
              chosen={chosen}
              onToggle={toggleService}
              onQuantity={setQuantity}
              location={location}
              onLocationChange={changeLocation}
              options={options}
              locale={locale}
              copy={copy}
              pricing={pricing}
              contactHref={links.contact}
              error={stepError}
            />
          )}

          {step === 1 &&
            (isClient && items.length > 0 && availability.status === "ready" ? (
              <DateTimeStep
                locale={locale}
                copy={copy}
                month={month}
                onMonthChange={setMonth}
                canGoBack={month > firstMonth}
                canGoForward={month < lastMonth}
                date={date}
                onDateChange={(next) => {
                  setDate(next);
                  setStepError(null);
                  if (time && !slotsFor(next).includes(time)) setTime(null);
                }}
                isAvailable={hasHours}
                isFull={(key) => slotsFor(key).length === 0}
                slots={slots}
                unavailableSlots={unavailableSlots}
                time={time}
                onTimeChange={(next) => {
                  setTime(next);
                  setStepError(null);
                }}
                error={stepError}
              />
            ) : availability.status === "error" ? (
              <div className="border-y border-line py-10">
                <ErrorText>{copy.datetime.loadError}</ErrorText>
                <button
                  type="button"
                  onClick={() => setReloads((count) => count + 1)}
                  className="btn btn-outline mt-6"
                >
                  {copy.datetime.retry}
                </button>
              </div>
            ) : (
              <div className="grid h-96 place-items-center bg-cream">
                <p role="status" className="text-small text-stone">
                  {copy.datetime.loading}
                </p>
              </div>
            ))}

          {step === 2 && (
            <DetailsStep
              copy={copy}
              needsAddress={location === "client"}
              details={details}
              onChange={setDetails}
              errors={detailErrors}
            />
          )}

          {step === 3 && items.length > 0 && date && time && (
            <ReviewStep
              locale={locale}
              copy={copy}
              pricing={pricing}
              items={items}
              location={location}
              options={options}
              date={date}
              time={time}
              details={details}
              privacyHref={links.privacy}
              formAction={formAction}
              pending={pending}
              result={result}
              onEdit={goTo}
            />
          )}

          {step < 3 && (
            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="btn btn-outline"
                >
                  {copy.actions.back}
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={proceed}
                className="btn btn-primary"
              >
                {copy.actions.continue}
              </button>
            </div>
          )}
          {step === 3 &&
            result.status === "error" &&
            Object.keys(result.fields).length === 0 && (
              <ErrorText>{copy.errors.generic}</ErrorText>
            )}
        </div>

        <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block">
          <div className="sticky top-28">{summary(false)}</div>
        </aside>
      </div>
    </div>
  );
}

/* ——— Progress ——— */

function Progress({
  copy,
  step,
  onStepClick,
}: {
  copy: Copy;
  step: number;
  onStepClick: (step: number) => void;
}) {
  const total = STEP_KEYS.length;
  return (
    <nav aria-label={copy.progressLabel}>
      {/* Phones: one line and a thin bar. */}
      <div className="sm:hidden">
        <p className="eyebrow text-stone">
          {copy.stepOf
            .replace("{current}", String(step + 1))
            .replace("{total}", String(total))}
          {" · "}
          <span className="text-ink">{copy.steps[STEP_KEYS[step]]}</span>
        </p>
        <div className="mt-4 h-px bg-line">
          <div
            className="h-px bg-ink transition-[width] duration-500 ease-soft"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Larger screens: every step, earlier ones clickable. */}
      <ol className="hidden border-b border-line sm:grid sm:grid-cols-4">
        {STEP_KEYS.map((key, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li key={key}>
              <button
                type="button"
                disabled={!done}
                aria-current={current ? "step" : undefined}
                onClick={() => onStepClick(index)}
                className={cn(
                  "relative flex w-full items-baseline gap-3 py-4 text-left transition-opacity duration-300",
                  current
                    ? "opacity-100"
                    : done
                      ? "cursor-pointer opacity-70 hover:opacity-100"
                      : "opacity-35",
                )}
              >
                <span className="text-small tabular-nums text-stone">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-label uppercase">{copy.steps[key]}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-0 -bottom-px left-0 h-px origin-left bg-ink transition-transform duration-500 ease-soft",
                    current || done ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ——— Summary ——— */

function Summary({
  compact,
  copy,
  locale,
  pricing,
  items,
  date,
  time,
}: {
  compact: boolean;
  copy: Copy;
  locale: Locale;
  pricing: Dictionary["pricing"];
  items: ChosenService[];
  date: DateKey | null;
  time: string | null;
}) {
  const when = date
    ? `${capitalize(formatLongDate(date, locale))}${time ? `, ${time}` : ""}`
    : null;
  const minutes = totalMinutes(items);
  const price = totalPrice(items, locale, pricing);

  if (compact) {
    if (items.length === 0) return null;
    return (
      <div className="border-y border-line py-4 text-small">
        <p className="font-display text-[1.1875rem]">{items.map(itemLabel).join(", ")}</p>
        <p className="mt-1 text-stone">{[when, price].filter(Boolean).join(" · ")}</p>
      </div>
    );
  }

  return (
    <div aria-live="polite" className="bg-cream p-7">
      <p className="eyebrow text-stone">{copy.summary.title}</p>
      {items.length === 0 ? (
        <p className="mt-4 text-small text-stone">{copy.summary.empty}</p>
      ) : (
        <>
          <ul className="mt-5 space-y-1.5">
            {items.map((item) => (
              <li key={item.service.id} className="font-display text-[1.375rem] leading-tight">
                {itemLabel(item)}
              </li>
            ))}
          </ul>
          {minutes > 0 && (
            <p className="mt-2 text-small text-stone">{formatDuration(minutes, pricing)}</p>
          )}
          <dl className="mt-6 space-y-3 border-t border-ink/15 pt-5 text-small">
            <div className="flex justify-between gap-4">
              <dt className="text-stone">{copy.review.date}</dt>
              <dd className="text-right">{when ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone">{copy.review.price}</dt>
              <dd className="text-right font-display text-[1.25rem] leading-none lining-nums">
                {price}
              </dd>
            </div>
          </dl>
        </>
      )}
    </div>
  );
}

/* ——— Manage link, after sending ——— */

function ManageLink({ href, copy }: { href: string; copy: Copy }) {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard
      ?.writeText(new URL(href, window.location.origin).toString())
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };
  return (
    <div className="mt-8 border border-line p-5">
      <p className="text-small text-stone">{copy.success.manageText}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href={href} className="link-line text-small text-ink [background-size:100%_1px]">
          {copy.success.manage}
        </Link>
        <button
          type="button"
          onClick={copyLink}
          className="min-h-11 cursor-pointer text-small text-stone underline-offset-4 hover:text-ink hover:underline"
        >
          {copied ? copy.success.copied : copy.success.copy}
        </button>
      </div>
    </div>
  );
}
