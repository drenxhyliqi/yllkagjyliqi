"use client";

import { ArrowRightIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { toDateKey, type DateKey } from "@/lib/booking/availability";
import { formatLongDate, formatMonthYear, weekdayName } from "@/lib/dates";
import { capitalize, cn } from "@/lib/utils";

type BookingCalendarProps = {
  locale: Locale;
  /** First day of the month being shown. */
  month: Date;
  onMonthChange: (month: Date) => void;
  selected: DateKey | null;
  onSelect: (date: DateKey) => void;
  /** The day has opening hours, so it can be opened. */
  isAvailable: (date: DateKey) => boolean;
  /** Open, but every time is already taken: shown lighter, still opens. */
  isFull: (date: DateKey) => boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  labels: { previousMonth: string; nextMonth: string; dayFull: string };
};

/** Month grid, Monday first. Unavailable days stay visible but can't be chosen. */
export function BookingCalendar({
  locale,
  month,
  onMonthChange,
  selected,
  onSelect,
  isAvailable,
  isFull,
  canGoBack,
  canGoForward,
  labels,
}: BookingCalendarProps) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Empty cells before the 1st (Monday = 0).
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const todayKey = toDateKey(new Date());

  const monthLabel = capitalize(formatMonthYear(month, locale));
  const weekdays = [1, 2, 3, 4, 5, 6, 7].map((day) =>
    weekdayName(day, locale, "short"),
  );

  const shift = (months: number) =>
    onMonthChange(new Date(year, monthIndex + months, 1));

  return (
    <div>
      <div className="flex items-center justify-between">
        <p aria-live="polite" className="font-display text-display-sm">
          {monthLabel}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canGoBack}
            aria-label={labels.previousMonth}
            className="grid size-10 cursor-pointer place-items-center transition-opacity disabled:cursor-default disabled:opacity-25"
          >
            <ArrowRightIcon className="w-5 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={!canGoForward}
            aria-label={labels.nextMonth}
            className="grid size-10 cursor-pointer place-items-center transition-opacity disabled:cursor-default disabled:opacity-25"
          >
            <ArrowRightIcon className="w-5" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 text-center" aria-hidden="true">
        {weekdays.map((weekday) => (
          <span key={weekday} className="eyebrow pb-3 text-stone">
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: offset }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const date = new Date(year, monthIndex, index + 1);
          const key = toDateKey(date);
          const available = isAvailable(key);
          const full = available && isFull(key);
          const isSelected = key === selected;
          return (
            <button
              key={key}
              type="button"
              disabled={!available}
              aria-pressed={isSelected}
              aria-label={`${capitalize(formatLongDate(date, locale))}${full ? ` – ${labels.dayFull}` : ""}`}
              onClick={() => onSelect(key)}
              className={cn(
                "relative grid aspect-square cursor-pointer place-items-center text-body tabular-nums transition-colors duration-200",
                isSelected
                  ? "bg-ink text-paper"
                  : full
                    ? "text-ink/40 hover:bg-cream"
                    : available
                      ? "hover:bg-cream"
                      : "cursor-default text-ink/25",
              )}
            >
              {index + 1}
              {key === todayKey && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-[18%] size-1 rounded-full",
                    isSelected ? "bg-paper" : "bg-current",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
