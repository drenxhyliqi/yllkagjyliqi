import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getBusinessInfo } from "@/lib/data/business";
import { getLegalDocument, LEGAL_UPDATED } from "@/lib/legal";
import { getNavigation, type LegalSlug } from "@/lib/navigation";

/** Shared by the privacy, cookies and terms routes. */
export async function legalMetadata(slug: LegalSlug): Promise<Metadata> {
  const [locale, business] = await Promise.all([
    getLocale(),
    getBusinessInfo(),
  ]);
  const document = getLegalDocument(slug, locale, business);
  return { title: document.title, description: document.description };
}

export async function LegalRoute({ slug }: { slug: LegalSlug }) {
  const locale = await getLocale();
  const [dict, business] = await Promise.all([
    getDictionary(),
    getBusinessInfo(),
  ]);

  return (
    <LegalPage
      locale={locale}
      slug={slug}
      document={getLegalDocument(slug, locale, business)}
      updated={LEGAL_UPDATED}
      links={getNavigation(locale, dict).legal}
      copy={dict.legal}
    />
  );
}
