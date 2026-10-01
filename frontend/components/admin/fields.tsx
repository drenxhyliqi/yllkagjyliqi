"use client";

import { useId, useState, type ReactNode } from "react";

import { Switch } from "@/components/admin/switch";
import { ChevronDownIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label above, control, then a hint or an error below. */
function FieldShell({ id, label, hint, error, optional, className, children }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-label text-stone uppercase">
        {label}
        {optional && (
          <span className="ml-2 tracking-normal normal-case">({adminText.common.optional})</span>
        )}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-message`} role="alert" className="mt-1.5 text-small text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-message`} className="mt-1.5 text-small text-stone">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

type TextFieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** Text after the input, e.g. "€". */
  suffix?: string;
};

export function TextField({ label, hint, error, optional, suffix, className, ...input }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-message` : undefined}
          className={cn("input placeholder:text-stone/60", suffix && "pr-10")}
          {...input}
        />
        {suffix && (
          <span aria-hidden="true" className="absolute top-1/2 right-4 -translate-y-1/2 text-stone">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

type TextAreaFieldProps = Omit<React.ComponentProps<"textarea">, "id"> & {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
};

export function TextAreaField({ label, hint, error, optional, className, ...textarea }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className="input min-h-24 resize-y placeholder:text-stone/60"
        {...textarea}
      />
    </FieldShell>
  );
}

export type Option = { value: string; label: string };

type SelectFieldProps = Omit<React.ComponentProps<"select">, "id"> & {
  label: string;
  options: Option[];
  hint?: string;
  error?: string;
};

export function SelectField({ label, options, hint, error, className, ...select }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-message` : undefined}
          className="input cursor-pointer appearance-none pr-11"
          {...select}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2" />
      </div>
    </FieldShell>
  );
}

type SwitchFieldProps = {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

/** A labelled on/off row, e.g. "Visible on the website". */
export function SwitchField({ name, label, hint, defaultChecked = false, onChange }: SwitchFieldProps) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line py-4">
      <div className="min-w-0 pt-2.5">
        <p className="leading-snug">{label}</p>
        {hint && <p className="mt-1 text-small text-stone">{hint}</p>}
      </div>
      <Switch
        name={name}
        checked={checked}
        label={label}
        onChange={(next) => {
          setChecked(next);
          onChange?.(next);
        }}
      />
    </div>
  );
}

/**
 * The optional English versions of the texts, folded away so the form stays
 * short on a phone. Opens by itself when something is already filled in.
 */
export function EnglishFields({ defaultOpen, children }: { defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-y border-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span>
          {adminText.common.english}
          <span className="ml-2 text-small text-stone">({adminText.common.optional})</span>
        </span>
        <ChevronDownIcon className="size-4 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="space-y-5 pb-6">
        <p className="text-small text-stone">{adminText.common.englishHint}</p>
        {children}
      </div>
    </details>
  );
}
