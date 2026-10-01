import "server-only";

import { apiFetch } from "@/lib/api";

/** A cached, tagged read from the public API. */
export function publicFetch<T>(path: string, tag: string): Promise<T> {
  return apiFetch<T>(path, { cache: "force-cache", next: { tags: [tag] } });
}

/** Image as the API sends it. */
export type ApiImage = { src: string; alt: string; width: number; height: number };
