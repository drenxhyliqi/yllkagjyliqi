import "server-only";

import type { Locale } from "@/i18n/config";
import { getDemoFeaturedWork, getDemoPortfolio } from "@/lib/demo/portfolio";
import type { PortfolioItem } from "@/types/portfolio";

/*
 * Portfolio items, published only, in display order.
 *
 * These return demo data for now. When the portfolio API exists they become
 * `apiFetch` calls; callers and components stay the same.
 */

export async function getPortfolio(locale: Locale): Promise<PortfolioItem[]> {
  return getDemoPortfolio(locale);
}

/** Items marked as featured, for the homepage. */
export async function getFeaturedWork(
  locale: Locale,
): Promise<PortfolioItem[]> {
  return getDemoFeaturedWork(locale);
}

export async function getPortfolioItem(
  locale: Locale,
  slug: string,
): Promise<PortfolioItem | null> {
  return (
    (await getPortfolio(locale)).find((item) => item.slug === slug) ?? null
  );
}
