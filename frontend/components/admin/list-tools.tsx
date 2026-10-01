"use client";

import { useState, useTransition } from "react";

import { moved } from "@/components/admin/move-buttons";
import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";

/** Keeps a reordered list locally and saves it; puts it back if saving fails. */
export function useOrder<T extends { id: string }>(
  items: T[],
  save: (ids: string[]) => Promise<FormState>,
) {
  const [order, setOrder] = useState(items);
  const [error, setError] = useState<string>();
  const [, startTransition] = useTransition();

  const move = (index: number, delta: -1 | 1) => {
    const previous = order;
    const next = moved(order, index, delta);
    setOrder(next);
    setError(undefined);
    startTransition(async () => {
      const result = await save(next.map((item) => item.id));
      if (result.status === "error") {
        setOrder(previous);
        setError(result.message);
      }
    });
  };
  return { order, move, error };
}

export function ErrorLine({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-3 text-small text-error">
      {message}
    </p>
  ) : null;
}

export function HiddenBadge() {
  return (
    <span className="border border-line px-2 py-0.5 text-eyebrow tracking-[0.18em] text-stone uppercase">
      {adminText.common.hidden}
    </span>
  );
}
