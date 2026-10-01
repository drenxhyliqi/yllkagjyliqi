import "server-only";

import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { contentTags } from "@/lib/content-tags";
import { publicFetchOr, type ApiImage } from "@/lib/data/public-api";
import type { PortfolioItem } from "@/types/portfolio";

type ApiPortfolioItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: { slug: string; name: string } | null;
  is_featured: boolean;
  images: ApiImage[];
};

/** Published work with photos, in gallery order. */
export const getPortfolio = cache(async (locale: Locale): Promise<PortfolioItem[]> => {
  const items = await publicFetchOr<ApiPortfolioItem[]>(
    `/api/portfolio?locale=${locale}`,
    contentTags.portfolio,
    [],
  );
  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    description: item.description,
    category: item.category,
    featured: item.is_featured,
    cover: item.images[0],
    images: item.images,
  }));
});

/** Items marked as featured, for the homepage. */
export async function getFeaturedWork(locale: Locale): Promise<PortfolioItem[]> {
  return (await getPortfolio(locale)).filter((item) => item.featured);
}

export async function getPortfolioItem(
  locale: Locale,
  slug: string,
): Promise<PortfolioItem | null> {
  return (await getPortfolio(locale)).find((item) => item.slug === slug) ?? null;
}
