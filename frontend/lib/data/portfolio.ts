import "server-only";

import type { Locale } from "@/i18n/config";
import { getDemoFeaturedWork } from "@/lib/demo/portfolio";
import type { PortfolioItem } from "@/types/portfolio";

/**
 * Portfolio items marked as featured, in display order.
 *
 * Returns demo data for now. When the portfolio API exists this becomes an
 * `apiFetch` call; callers and components stay the same.
 */
export async function getFeaturedWork(locale: Locale): Promise<PortfolioItem[]> {
  return getDemoFeaturedWork(locale);
}
