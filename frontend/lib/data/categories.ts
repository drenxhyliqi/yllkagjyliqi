import "server-only";

import type { Locale } from "@/i18n/config";
import { getServiceCatalog } from "@/lib/data/services";
import type { Category } from "@/types/category";

/** Active service categories, in display order. */
export async function getCategories(locale: Locale): Promise<Category[]> {
  return (await getServiceCatalog(locale)).map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    image: category.image,
  }));
}
