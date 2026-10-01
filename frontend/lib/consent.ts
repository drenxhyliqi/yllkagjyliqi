/**
 * Cookie consent, stored in the visitor's browser.
 *
 * "all"       — the visitor accepted optional cookies (e.g. analytics).
 * "necessary" — only cookies the site needs to work.
 *
 * Nothing optional exists yet; any future analytics must check
 * `getConsent() === "all"` before loading.
 */
export type Consent = "all" | "necessary";

export const CONSENT_COOKIE = "cookie-consent";
/** Fired by "Cookie settings" in the footer to reopen the banner. */
export const OPEN_CONSENT_EVENT = "yllka:open-cookie-consent";

const SIX_MONTHS = 60 * 60 * 24 * 182;

export function getConsent(): Consent | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|necessary)`),
  );
  return match ? (match[1] as Consent) : null;
}

export function saveConsent(consent: Consent) {
  document.cookie = `${CONSENT_COOKIE}=${consent}; path=/; max-age=${SIX_MONTHS}; samesite=lax`;
}
