import Link from "next/link";

import { CookieSettingsButton } from "@/components/layout/cookie-settings-button";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { Logo } from "@/components/ui/logo";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { groupOpeningHours } from "@/lib/hours";
import type { getNavigation } from "@/lib/navigation";
import type { BusinessInfo } from "@/types/business";

type SiteFooterProps = {
  locale: Locale;
  navigation: ReturnType<typeof getNavigation>;
  business: BusinessInfo;
  copy: Dictionary["footer"];
  labels: { home: string; bookAppointment: string; language: string };
};

const valueClass = "font-display text-[1.1875rem] leading-snug lining-nums";

export function SiteFooter({
  locale,
  navigation,
  business,
  copy,
  labels,
}: SiteFooterProps) {
  const hours = groupOpeningHours(business.hours, locale);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="container-site pt-16 pb-10 lg:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-3">
            <Link
              href={navigation.home}
              aria-label={labels.home}
              className="inline-block"
            >
              <Logo className="h-11 w-auto" />
            </Link>
            <p className="eyebrow mt-6 text-stone">{copy.tagline}</p>
          </div>

          <nav
            aria-labelledby="footer-explore"
            className="lg:col-span-2 lg:col-start-5"
          >
            <h2 id="footer-explore" className="eyebrow text-stone">
              {copy.explore}
            </h2>
            <ul className="mt-6 space-y-2.5">
              {navigation.mobile.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`link-line ${valueClass}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={navigation.booking}
                  className={`link-line ${valueClass}`}
                >
                  {labels.bookAppointment}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-stone">{copy.contact}</h2>
            <address className="mt-6 space-y-2.5 not-italic">
              {business.phone && (
                <p>
                  <a
                    href={`tel:${business.phone.replace(/[^\d+]/g, "")}`}
                    className={`link-line ${valueClass}`}
                  >
                    {business.phone}
                  </a>
                </p>
              )}
              {business.email && (
                <p>
                  <a
                    href={`mailto:${business.email}`}
                    className={`link-line ${valueClass}`}
                  >
                    {business.email}
                  </a>
                </p>
              )}
              {business.instagram && (
                <p>
                  <a
                    href={business.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`link-line ${valueClass}`}
                  >
                    Instagram · @{business.instagram.handle}
                  </a>
                </p>
              )}
              {business.facebook && (
                <p>
                  <a
                    href={business.facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`link-line ${valueClass}`}
                  >
                    Facebook
                  </a>
                </p>
              )}
              {business.address && (
                <p className={`${valueClass} pt-3`}>
                  {business.address.street}
                  <br />
                  {business.address.city}
                </p>
              )}
              {business.mapsUrl && (
                <p>
                  <a
                    href={business.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-line text-label uppercase [--line-trim:0.16em]"
                  >
                    {copy.directions}
                  </a>
                </p>
              )}
            </address>
          </div>

          <div className="lg:col-span-3 lg:col-start-10">
            <h2 className="eyebrow text-stone">{copy.hours}</h2>
            <dl className="mt-6 space-y-2.5">
              {hours.map((row) => (
                <div
                  key={row.days}
                  className="flex items-baseline justify-between gap-6 border-b border-line pb-2.5"
                >
                  <dt className={valueClass}>{row.days}</dt>
                  <dd
                    className={
                      row.time
                        ? "text-small tabular-nums"
                        : "text-small text-stone"
                    }
                  >
                    {row.time ?? copy.closed}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-24">
          <nav aria-label={copy.legalNav}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-small text-stone">
              {navigation.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="link-line transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton
                  label={copy.cookieSettings}
                  className="link-line cursor-pointer transition-colors hover:text-ink"
                />
              </li>
            </ul>
          </nav>
          <LanguageSwitcher locale={locale} label={labels.language} />
        </div>

        <div className="mt-8 flex flex-col gap-2 text-small text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {business.name}. {copy.rights}
          </p>
          <p>
            {copy.siteBy}{" "}
            <a
              href="https://www.venight.com"
              target="_blank"
              rel="noopener"
              className="link-line text-ink"
            >
              Venight
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
