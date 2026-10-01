"use client";

import { useActionState, useState } from "react";

import { deleteService, saveService } from "@/app/admin/(panel)/services/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  EnglishFields,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
  type Option,
} from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { adminText } from "@/i18n/admin";
import { durationLabel } from "@/lib/admin/format";
import type { FormState } from "@/lib/admin/mutate";
import { cn } from "@/lib/utils";
import type { AdminService } from "@/types/admin-content";
import type { PriceType } from "@/types/service";

const text = adminText.services.form;

const DURATIONS = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 300, 360, 480];

const priceTypes: { value: PriceType; label: string }[] = [
  { value: "fixed", label: text.fixed },
  { value: "from", label: text.from },
  { value: "on_request", label: text.onRequest },
];

/** "12.5" → "12,50", the way prices are written in Kosovo. */
function priceInput(price: number | null): string {
  if (price === null) return "";
  return Number.isInteger(price) ? String(price) : price.toFixed(2).replace(".", ",");
}

type ServiceFormProps = {
  service: AdminService | null;
  categories: Option[];
  defaultCategory?: string;
};

export function ServiceForm({ service, categories, defaultCategory }: ServiceFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveService.bind(null, service?.id ?? null),
    { status: "idle" },
  );
  const [priceType, setPriceType] = useState<PriceType>(service?.price_type ?? "fixed");
  const errorFor = (field: string) =>
    state.status === "error" && state.field === field ? state.message : undefined;

  const durations = DURATIONS.includes(service?.duration_minutes ?? 0) || !service?.duration_minutes
    ? DURATIONS
    : [...DURATIONS, service.duration_minutes].sort((a, b) => a - b);

  return (
    <>
      <form action={formAction} className="space-y-6" noValidate={false}>
        <TextField
          label={text.name}
          name="name_sq"
          defaultValue={service?.name_sq}
          placeholder={text.namePlaceholder}
          required
          maxLength={100}
          autoComplete="off"
          error={errorFor("name_sq")}
        />

        <SelectField
          label={adminText.services.form.category}
          name="category_id"
          defaultValue={service?.category_id ?? defaultCategory ?? categories[0]?.value}
          options={categories}
          error={errorFor("category_id")}
        />

        <fieldset>
          <legend className="text-label text-stone uppercase">{text.priceType}</legend>
          <div className="mt-1.5 grid grid-cols-3 border border-ink/28">
            {priceTypes.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "relative flex min-h-12 cursor-pointer items-center justify-center px-2 text-center text-small leading-tight transition-colors not-first:border-l not-first:border-ink/28",
                  "has-checked:bg-ink has-checked:text-paper has-focus-visible:outline has-focus-visible:outline-offset-2 has-focus-visible:outline-ink",
                )}
              >
                <input
                  type="radio"
                  name="price_type"
                  value={option.value}
                  checked={priceType === option.value}
                  onChange={() => setPriceType(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
          {priceType === "on_request" && (
            <p className="mt-1.5 text-small text-stone">{text.onRequestHint}</p>
          )}
        </fieldset>

        {priceType !== "on_request" && (
          <TextField
            label={text.price}
            name="price"
            defaultValue={priceInput(service?.price ?? null)}
            inputMode="decimal"
            placeholder="25"
            suffix="€"
            required
            autoComplete="off"
            error={errorFor("price")}
            className="max-w-48"
          />
        )}

        <SelectField
          label={text.duration}
          name="duration_minutes"
          defaultValue={service?.duration_minutes ? String(service.duration_minutes) : "60"}
          hint={text.durationHint}
          options={[
            ...durations.map((minutes) => ({ value: String(minutes), label: durationLabel(minutes) })),
            { value: "", label: text.noDuration },
          ]}
          error={errorFor("duration_minutes")}
        />

        <TextAreaField
          label={text.description}
          name="description_sq"
          defaultValue={service?.description_sq ?? ""}
          hint={text.descriptionHint}
          maxLength={500}
          optional
          error={errorFor("description_sq")}
        />

        <EnglishFields defaultOpen={Boolean(service?.name_en || service?.description_en)}>
          <TextField
            label={text.name}
            name="name_en"
            defaultValue={service?.name_en ?? ""}
            maxLength={100}
            autoComplete="off"
            lang="en"
            error={errorFor("name_en")}
          />
          <TextAreaField
            label={text.description}
            name="description_en"
            defaultValue={service?.description_en ?? ""}
            maxLength={500}
            lang="en"
            error={errorFor("description_en")}
          />
        </EnglishFields>

        <SwitchField
          name="is_active"
          label={adminText.common.visible}
          hint={text.visibleHint}
          defaultChecked={service?.is_active ?? true}
        />

        <FormFooter state={state} pending={pending} label={service ? text.save : text.create} />
      </form>

      {service && (
        <div className="mt-12">
          <ConfirmDelete
            label={text.delete}
            question={text.deleteConfirm}
            action={() => deleteService(service.id)}
          />
        </div>
      )}
    </>
  );
}
