import "server-only";

import { ApiError, apiFetch } from "@/lib/api";

/*
 * Public content changes only when Yllka saves in the admin, and every save
 * expires its tag right away. The daily refresh is only a safety net: each
 * refresh rewrites the cached page, so a short interval costs ISR writes and
 * CPU on every visit without ever showing anything new.
 */
const REFRESH_SECONDS = 86_400;

/** A cached, tagged read from the public API. Throws ApiError on failure. */
export function publicFetch<T>(path: string, tag: string): Promise<T> {
  return apiFetch<T>(path, { cache: "force-cache", next: { tags: [tag], revalidate: REFRESH_SECONDS } });
}

/**
 * Like publicFetch, but when the API can't be reached (or fails) during a
 * build, returns `fallback` so a preview or local build still completes with
 * empty sections.
 *
 * Production builds on Vercel fail instead: the live site keeps its last good
 * deployment rather than being replaced by an empty one (e.g. when API_URL is
 * missing or wrong). Outside a build the error is thrown too, so a refresh
 * that can't reach the API keeps serving the last good page and tries again
 * on the next visit.
 */
export async function publicFetchOr<T>(path: string, tag: string, fallback: T): Promise<T> {
  try {
    return await publicFetch<T>(path, tag);
  } catch (error) {
    const unavailable = error instanceof ApiError && (error.status === 0 || error.status >= 500);
    const building = process.env.NEXT_PHASE === "phase-production-build";
    if (!unavailable || !building) throw error;
    if (process.env.VERCEL_ENV === "production") {
      throw new Error(`The API is unavailable for ${path}: is API_URL set to the Railway address?`, {
        cause: error,
      });
    }
    console.error(`API unavailable for ${path}; building the page without it.`);
    return fallback;
  }
}

/** Image as the API sends it. */
export type ApiImage = { src: string; alt: string; width: number; height: number };
