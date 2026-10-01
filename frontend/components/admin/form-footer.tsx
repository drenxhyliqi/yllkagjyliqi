"use client";

import type { FormState } from "@/lib/admin/mutate";
import { adminText } from "@/i18n/admin";

type FormFooterProps = {
  state: FormState;
  pending: boolean;
  label: string;
  disabled?: boolean;
};

/** Save button plus a status line that screen readers announce. */
export function FormFooter({ state, pending, label, disabled }: FormFooterProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
      <button
        type="submit"
        disabled={pending || disabled}
        className="btn btn-primary w-full disabled:opacity-45 sm:w-auto"
      >
        {pending ? adminText.common.saving : label}
      </button>
      <p
        key={state.savedAt ?? state.status}
        role="status"
        className={state.status === "error" ? "text-small text-error" : "text-small text-stone"}
      >
        {state.status === "saved" && adminText.common.saved}
        {state.status === "error" && state.message}
      </p>
    </div>
  );
}
