import "server-only";

import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { contentTags } from "@/lib/content-tags";
import { publicFetch, type ApiImage } from "@/lib/data/public-api";
import type { Category } from "@/types/category";
import type { CategoryWithServices, PriceType } from "@/types/service";

type ApiService = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  price_type: PriceType;
  duration_minutes: number | null;
};

type ApiCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: ApiImage | null;
  services: ApiService[];
};

/** Active categories with their active services, both in display order. */
export const getServiceCatalog = cache(
  async (locale: Locale): Promise<CategoryWithServices[]> => {
    const categories = await publicFetch<ApiCategory[]>(
      `/api/catalog?locale=${locale}`,
      contentTags.catalog,
    );
    return categories.map(
      (category): CategoryWithServices => ({
        ...toCategory(category),
        services: category.services.map((service) => ({
          id: service.id,
          slug: service.slug,
          name: service.name,
          description: service.description,
          price: service.price,
          priceType: service.price_type,
          durationMinutes: service.duration_minutes,
        })),
      }),
    );
  },
);

function toCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description ?? "",
    image: category.image,
  };
}
