"use server";

import { headers } from "next/headers";

import { adminText } from "@/i18n/admin";
import { ApiError, apiFetch } from "@/lib/api";

const text = adminText.reset;

export type ResetState = { status: "idle" | "done" | "error"; message?: string; field?: string };

export async function requestReset(_previous: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { status: "error", field: "email", message: adminText.login.missing };
  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip") ?? "unknown";
  try {
    await apiFetch("/api/auth/password-reset", {
      method: "POST",
      headers: { "X-Client-IP": clientIp },
      json: { email },
    });
  } catch {
    return { status: "error", message: text.error };
  }
  // The same answer whether or not the email has an account.
  return { status: "done" };
}

export async function finishReset(token: string, _previous: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) return { status: "error", field: "password", message: text.tooShort };
  if (password !== String(formData.get("repeat") ?? "")) {
    return { status: "error", field: "repeat", message: text.mismatch };
  }
  try {
    await apiFetch("/api/auth/password-reset/confirm", {
      method: "POST",
      json: { token, new_password: password },
    });
  } catch (error) {
    const invalid = error instanceof ApiError && error.status === 422;
    return { status: "error", message: invalid ? text.invalid : text.error, field: invalid ? "token" : undefined };
  }
  return { status: "done" };
}
