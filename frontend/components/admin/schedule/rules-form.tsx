"use client";

import { useActionState, useState } from "react";

import { saveRules } from "@/app/admin/(panel)/appointments/actions";
import { EnglishFields, SelectField, SwitchField, TextAreaField, TextField, type Option } from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";
import type { BookingRules } from "@/types/schedule";

const text = adminText.schedule.rules;
const minutes = (m: number) => `${m} ${text.minutes}`;
const asOptions = (values: number[], label: (value: number) => string): Option[] =>
  values.map((value) => ({ value: String(value), label: label(value) }));

/** Keeps a value saved outside these presets selectable instead of silently changing it. */
function withCurrent(options: Option[], current: number, label: (value: number) => string): Option[] {
  return options.some((option) => option.value === String(current))
    ? options
    : [...options, { value: String(current), label: label(current) }].sort(
        (a, b) => Number(a.value) - Number(b.value),
      );
}

const intervals = asOptions([15, 20, 30, 45, 60], minutes);
const notices: Option[] = [
  { value: "0", label: text.noNotice },
  ...asOptions([60, 120, 240], (m) => text.hours(m / 60)),
  ...asOptions([1440, 2880], (m) => text.days(m / 1440)),
];
const windows: Option[] = [
  { value: "14", label: text.weeks(2) },
  ...asOptions([30, 60, 90, 180], (d) => text.months(d / 30)),
];
const buffers: Option[] = [{ value: "0", label: text.noBuffer }, ...asOptions([5, 10, 15, 20, 30, 45, 60], minutes)];
const travels = asOptions([15, 20, 30, 45, 60, 90, 120], minutes);
const cancellations: Option[] = [
  { value: "0", label: text.anytime },
  ...asOptions([2, 6, 12, 24, 48, 72], text.hoursBefore),
];

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-6">
      <legend className="float-left mb-4 w-full font-display text-[1.375rem]">{title}</legend>
      <div className="clear-both space-y-5">{children}</div>
    </fieldset>
  );
}

export function RulesForm({ rules }: { rules: BookingRules }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveRules, {
    status: "idle",
  });
  const [visits, setVisits] = useState(rules.home_visits);

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <SelectField
          label={text.interval}
          name="slot_interval_minutes"
          defaultValue={String(rules.slot_interval_minutes)}
          options={withCurrent(intervals, rules.slot_interval_minutes, minutes)}
        />
        <SelectField
          label={text.buffer}
          name="buffer_minutes"
          defaultValue={String(rules.buffer_minutes)}
          hint={text.bufferHint}
          options={withCurrent(buffers, rules.buffer_minutes, minutes)}
        />
        <SelectField
          label={text.notice}
          name="min_notice_minutes"
          defaultValue={String(rules.min_notice_minutes)}
          options={withCurrent(notices, rules.min_notice_minutes, minutes)}
        />
        <SelectField
          label={text.window}
          name="booking_window_days"
          defaultValue={String(rules.booking_window_days)}
          options={withCurrent(windows, rules.booking_window_days, adminText.schedule.daysOff.days)}
        />
      </div>

      <Group title={text.visitsTitle}>
        <SwitchField name="home_visits" label={text.visits} hint={text.visitsHint} defaultChecked={rules.home_visits} onChange={setVisits} />
        {visits ? (
          <>
            <SelectField
              label={text.travel}
              name="travel_minutes"
              defaultValue={String(rules.travel_minutes)}
              hint={text.travelHint}
              options={withCurrent(travels, rules.travel_minutes, minutes)}
            />
            <TextField
              label={text.visitNote}
              name="home_visit_note_sq"
              defaultValue={rules.home_visit_note_sq ?? ""}
              placeholder={text.visitNotePlaceholder}
              maxLength={300}
              optional
            />
            <EnglishFields defaultOpen={Boolean(rules.home_visit_note_en)}>
              <TextField label={text.visitNote} name="home_visit_note_en" defaultValue={rules.home_visit_note_en ?? ""} maxLength={300} lang="en" />
            </EnglishFields>
          </>
        ) : (
          // Kept as they are while visits are off.
          <>
            <input type="hidden" name="travel_minutes" value={rules.travel_minutes} />
            <input type="hidden" name="home_visit_note_sq" value={rules.home_visit_note_sq ?? ""} />
            <input type="hidden" name="home_visit_note_en" value={rules.home_visit_note_en ?? ""} />
          </>
        )}
      </Group>

      <Group title={text.cancelTitle}>
        <SelectField
          label={text.cancelNotice}
          name="cancellation_notice_hours"
          defaultValue={String(rules.cancellation_notice_hours)}
          hint={text.cancelHint}
          options={withCurrent(cancellations, rules.cancellation_notice_hours, text.hoursBefore)}
        />
        <TextAreaField
          label={text.policy}
          name="policy_sq"
          defaultValue={rules.policy_sq ?? ""}
          hint={text.policyHint}
          placeholder={text.policyPlaceholder}
          maxLength={1000}
          optional
        />
        <EnglishFields defaultOpen={Boolean(rules.policy_en)}>
          <TextAreaField label={text.policy} name="policy_en" defaultValue={rules.policy_en ?? ""} maxLength={1000} lang="en" />
        </EnglishFields>
      </Group>

      <FormFooter state={state} pending={pending} label={text.save} />
    </form>
  );
}
