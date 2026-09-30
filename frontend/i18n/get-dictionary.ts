import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";

import { isLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  sq: () => import("./dictionaries/sq").then((module) => module.sq),
  en: () => import("./dictionaries/en").then((module) => module.en),
};

/** The locale of the current public route (from the `[locale]` segment). */
export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
