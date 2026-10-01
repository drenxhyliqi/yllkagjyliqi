"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminText } from "@/i18n/admin";
import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import type { LoginResponse } from "@/types/admin";

/** Cookie is scoped to /admin, so public pages never receive it. */
const COOKIE_PATH = "/admin";

export type LoginState = { message: string; email: string } | undefined;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { message: adminText.login.missing, email };
  }

  let result: LoginResponse;
  try {
    result = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      json: { email, password },
    });
  } catch (error) {
    const message =
      error instanceof ApiError && error.status === 401
        ? adminText.login.invalid
        : error instanceof ApiError && error.status === 429
          ? adminText.login.tooMany
          : adminText.login.unavailable;
    return { message, email };
  }

  (await cookies()).set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    expires: new Date(result.expires_at),
  });

  redirect(safeRedirect(next));
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    // Signing out locally must still work if the API is unreachable.
    await apiFetch("/api/auth/logout", { method: "POST", token }).catch(() => undefined);
  }
  cookieStore.delete({ name: SESSION_COOKIE, path: COOKIE_PATH });
  redirect("/admin/login");
}

/** Only return to admin pages on this site, never to an arbitrary URL. */
function safeRedirect(next: string): string {
  const isAdminPath = next === "/admin" || next.startsWith("/admin/");
  if (!isAdminPath || next.startsWith("/admin/login") || next.includes("//")) {
    return "/admin";
  }
  return next;
}
