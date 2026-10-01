import "server-only";

import { ApiError, apiFetch } from "@/lib/api";

/*
 * Public content is cached and refreshed two ways: right away when Yllka
 * saves in the admin (the tag is expired), and every few minutes anyway, so
 * the site catches up by itself, e.g. once the API comes online.
 */
const REFRESH_SECONDS = 300;

/** A cached, tagged read from the public API. Throws ApiError on failure. */
export function publicFetch<T>(path: string, tag: string): Promise<T> {
  return apiFetch<T>(path, { cache: "force-cache", next: { tags: [tag], revalidate: REFRESH_SECONDS } });
}

/**
 * Like publicFetch, but when the API can't be reached (or fails), returns
 * `fallback` instead of breaking the page or the whole build. Sections then
 * show as empty until the next refresh.
 */
export async function publicFetchOr<T>(path: string, tag: string, fallback: T): Promise<T> {
  try {
    return await publicFetch<T>(path, tag);
  } catch (error) {
    const unavailable = error instanceof ApiError && (error.status === 0 || error.status >= 500);
    if (!unavailable) throw error;
    console.error(`API unavailable for ${path}; showing the page without it.`);
    return fallback;
  }
}

/** Image as the API sends it. */
export type ApiImage = { src: string; alt: string; width: number; height: number };
