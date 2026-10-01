import type { MetadataRoute } from "next";

import { locales, localizePath } from "@/i18n/config";
import { getPortfolio } from "@/lib/data/portfolio";
import { legalSlugs } from "@/lib/navigation";
import { SITE_URL } from "@/lib/seo";

const PAGES = ["/", "/services", "/prices", "/work", "/about", "/contact", "/book"];

/** Every public page in both languages, each pointing to its translation. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Work pages come from the database; the rest of the sitemap still works if it's down.
  const work = await getPortfolio("sq").catch(() => []);
  const paths = [...PAGES, ...work.map((item) => `/work/${item.slug}`), ...legalSlugs.map((slug) => `/${slug}`)];

  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}${localizePath(locale, path)}`,
      changeFrequency: path === "/" || path === "/work" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "/" ? 1 : path === "/book" ? 0.9 : legalSlugs.some((slug) => path === `/${slug}`) ? 0.2 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          locales.map((other) => [other, `${SITE_URL}${localizePath(other, path)}`]),
        ),
      },
    })),
  );
}
