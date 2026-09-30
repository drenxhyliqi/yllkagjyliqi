import "server-only";

import type { Locale } from "@/i18n/config";
import { getDemoCategories } from "@/lib/demo/categories";
import type { Category } from "@/types/category";

/**
 * Active service categories, in display order.
 *
 * Returns demo data for now. When the categories API exists this becomes an
 * `apiFetch` call; callers and components stay the same.
 */
export async function getCategories(locale: Locale): Promise<Category[]> {
  return getDemoCategories(locale);
}
