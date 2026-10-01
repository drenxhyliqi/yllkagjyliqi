import type { Category } from "@/types/category";

/**
 * fixed      — "€25"
 * from       — "from €80": the final price depends on length, detail, etc.
 * on_request — no price shown; agreed with the client.
 */
export type PriceType = "fixed" | "from" | "on_request";

/** An active service as the public site receives it, in display order. */
export type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Whole euros; null when the price is on request. */
  price: number | null;
  priceType: PriceType;
  durationMinutes: number | null;
};

export type CategoryWithServices = Category & {
  services: Service[];
};
