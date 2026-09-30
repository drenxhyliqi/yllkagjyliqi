"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LOCALE_COOKIE,
  localeNames,
  locales,
  localeShortLabels,
  type Locale,
} from "@/i18n/config";
import { cn } from "@/lib/utils";

const ONE_YEAR = 60 * 60 * 24 * 365;

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  className?: string;
};

/** "AL / EN" — links to the current page in the other language. */
export function LanguageSwitcher({ locale, label, className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  // Everything after the locale segment, e.g. "/sq/work" → "/work".
  const rest = pathname.replace(/^\/[^/]+/, "");

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex items-center text-label uppercase", className)}
    >
      {locales.map((option, index) => (
        <span key={option} className="flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className="mx-2 opacity-35">
              /
            </span>
          )}
          <Link
            href={`/${option}${rest}`}
            hrefLang={option}
            lang={option}
            aria-current={option === locale ? "true" : undefined}
            onClick={() => rememberLocale(option)}
            className="-my-3 py-3 opacity-55 transition-opacity duration-300 hover:opacity-100 aria-[current=true]:opacity-100"
          >
            {localeShortLabels[option]}
            <span className="sr-only"> {localeNames[option]}</span>
          </Link>
        </span>
      ))}
    </div>
  );
}
