"use client";

import { useState, useTransition } from "react";

import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";

type ConfirmDeleteProps = {
  /** Button text, e.g. "Delete service". */
  label: string;
  /** The question, e.g. "Delete this service?". */
  question: string;
  action: () => Promise<FormState | void>;
};

/** A delete button that asks once more on the page itself, without a browser popup. */
export function ConfirmDelete({ label, question, action }: ConfirmDeleteProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      const result = await action();
      // On success the action redirects; anything returned is an error.
      if (result?.status === "error") {
        setError(result.message ?? adminText.common.deleteFailed);
        setConfirming(false);
      }
    });

  return (
    <div className="border-t border-line pt-6">
      {confirming ? (
        <div role="group" aria-label={question} className="bg-cream/60 p-5">
          <p className="font-display text-[1.25rem] leading-snug">{question}</p>
          <p className="mt-1 text-small text-stone">{adminText.common.irreversible}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={run}
              disabled={pending}
              className="btn btn-sm grow border-error bg-error text-paper sm:grow-0"
            >
              {pending ? adminText.common.deleting : adminText.common.deleteYes}
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
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(undefined);
            setConfirming(true);
          }}
          className="min-h-11 cursor-pointer text-small text-error underline-offset-4 hover:underline"
        >
          {label}
        </button>
      )}
      {error && (
        <p role="alert" className="mt-3 text-small text-error">
          {error}
        </p>
      )}
    </div>
  );
}
