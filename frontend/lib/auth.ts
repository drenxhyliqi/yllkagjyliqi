import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { ApiError, apiFetch } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import type { Admin } from "@/types/admin";

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/**
 * The signed-in admin, verified by the API (never trusted from the cookie alone).
 * Cached for the duration of one request.
 */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return await apiFetch<Admin>("/api/auth/me", { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

/** Use at the top of every protected admin page and action. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
