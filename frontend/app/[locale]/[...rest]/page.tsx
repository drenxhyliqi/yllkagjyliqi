import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.notFound.title };
}

/** Unknown paths inside a locale render the localized 404 page. */
export default function CatchAll() {
  notFound();
}
