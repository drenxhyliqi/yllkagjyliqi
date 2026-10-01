import "server-only";

import { unstable_rethrow } from "next/navigation";

import { adminText } from "@/i18n/admin";
import { ApiError } from "@/lib/api";
import { adminFetch } from "@/lib/admin/api";

export type FormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  /** The field the error is about, when known. */
  field?: string;
  /** Changes on every save, so the "saved" note shows again each time. */
  savedAt?: number;
};

type Init = Parameters<typeof adminFetch>[1];

/** Messages for API statuses; anything else gets the generic error. */
type Messages = Partial<Record<number, string>>;

/**
 * Runs an admin API call and turns failures into a FormState with a message
 * Yllka can act on. Redirects (e.g. to sign-in) pass through.
 */
export async function mutate<T = unknown>(
  path: string,
  init: Init,
  messages: Messages = {},
): Promise<{ ok: true; data: T } | { ok: false; state: FormState }> {
  try {
    return { ok: true, data: await adminFetch<T>(path, init) };
  } catch (error) {
    unstable_rethrow(error);
    if (!(error instanceof ApiError)) throw error;
    const message =
      messages[error.status] ??
      (error.status === 422 ? adminText.common.invalid : adminText.common.error);
    return { ok: false, state: { status: "error", message, field: error.field } };
  }
}

export const saved = (): FormState => ({ status: "saved", savedAt: Date.now() });

/** Reads a text field; empty becomes null. */
export function text(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

export function checked(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}
