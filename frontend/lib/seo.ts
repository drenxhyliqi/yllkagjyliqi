import type { Metadata } from "next";

import { locales, localizePath, type Locale } from "@/i18n/config";

/** The public address of the site, e.g. "https://yllka.com" (no trailing slash). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const ogLocale: Record<Locale, string> = { sq: "sq_AL", en: "en_GB" };

/**
 * Title, description, canonical address and the same page in the other
 * language, for search engines and link previews. `path` is without the
 * locale, e.g. "/work".
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  { title, description }: { title?: string; description?: string },
): Metadata {
  const url = localizePath(locale, path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((other) => [other, localizePath(other, path)])),
        "x-default": localizePath("sq", path),
      },
    },
    openGraph: {
      type: "website",
      siteName: "Yllka",
      locale: ogLocale[locale],
      alternateLocale: locales.filter((other) => other !== locale).map((other) => ogLocale[other]),
      url,
      ...(title && { title }),
      ...(description && { description }),
    },
    twitter: { card: "summary_large_image", ...(title && { title }), ...(description && { description }) },
  };
}
