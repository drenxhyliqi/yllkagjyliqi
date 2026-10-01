import "server-only";

import type { Locale } from "@/i18n/config";
import { getDemoServiceCatalog } from "@/lib/demo/services";
import type { CategoryWithServices } from "@/types/service";

/**
 * Active categories with their active services, both in display order.
 *
 * Returns demo data for now. When the services API exists this becomes an
 * `apiFetch` call; callers and components stay the same.
 */
export async function getServiceCatalog(
  locale: Locale,
): Promise<CategoryWithServices[]> {
  return getDemoServiceCatalog(locale);
}
