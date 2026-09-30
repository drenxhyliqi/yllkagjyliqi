export const locales = ["sq", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sq";

/** Remembers the visitor's language choice for visits to unprefixed URLs. */
export const LOCALE_COOKIE = "locale";

/** Short labels shown in the language switcher. Albanian is shown as "AL". */
export const localeShortLabels: Record<Locale, string> = {
  sq: "AL",
  en: "EN",
};

export const localeNames: Record<Locale, string> = {
  sq: "Shqip",
  en: "English",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** Prefixes an app path with the locale: ("en", "/work") → "/en/work". */
export function localizePath(locale: Locale, path: string): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
