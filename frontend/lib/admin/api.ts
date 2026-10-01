import "server-only";

import { redirect } from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/auth";

type Init = Parameters<typeof apiFetch>[1];

/**
 * A request to the admin API as the signed-in admin. A missing or expired
 * session goes to sign-in; other errors are thrown as ApiError.
 */
export async function adminFetch<T>(path: string, init?: Init): Promise<T> {
  const token = await getSessionToken();
  if (!token) redirect("/admin/login");
  try {
    return await apiFetch<T>(path, { ...init, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/admin/login");
    throw error;
  }
}

/** Like adminFetch, but a 404 becomes null (for edit pages of deleted things). */
export async function adminFetchOrNull<T>(path: string): Promise<T | null> {
  try {
    return await adminFetch<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
