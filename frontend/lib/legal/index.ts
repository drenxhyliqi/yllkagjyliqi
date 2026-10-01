import "server-only";

/*
 * DRAFT legal texts. They describe what this website actually does today
 * (no analytics, three necessary cookies), but they have not been reviewed
 * by a lawyer. Update them whenever data handling changes, e.g. when a
 * booking provider or analytics is added, and have them checked before launch.
 */

import type { Locale } from "@/i18n/config";
import { cookiesEn, privacyEn, termsEn } from "@/lib/legal/en";
import { cookiesSq, privacySq, termsSq } from "@/lib/legal/sq";
import type { LegalContext, LegalDocument } from "@/lib/legal/types";
import type { LegalSlug } from "@/lib/navigation";
import type { BusinessInfo } from "@/types/business";

/** When the texts last changed in substance. Shown at the top of each page. */
export const LEGAL_UPDATED = "2026-10-01";

const documents: Record<
  LegalSlug,
  Record<Locale, (ctx: LegalContext) => LegalDocument>
> = {
  privacy: { en: privacyEn, sq: privacySq },
  cookies: { en: cookiesEn, sq: cookiesSq },
  terms: { en: termsEn, sq: termsSq },
};

export function getLegalDocument(
  slug: LegalSlug,
  locale: Locale,
  business: BusinessInfo,
): LegalDocument {
  const address = business.address
    ? `${business.address.street}, ${business.address.city}`
    : null;
  return documents[slug][locale]({
    name: business.name,
    email: business.email,
    phone: business.phone,
    address,
  });
}
