import type { Metadata, Viewport } from "next";

import { fontVariables } from "@/app/fonts";
import { SiteHeader } from "@/components/layout/site-header";
import { Logo } from "@/components/ui/logo";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getNavigation } from "@/lib/navigation";

import "../globals.css";

// Only the configured locales exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: { default: dict.meta.title, template: "%s — Yllka" },
    description: dict.meta.description,
  };
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const dict = await getDictionary();
  const navigation = getNavigation(locale, dict);

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={fontVariables}>
      <body>
        <a
          href="#main"
          className="btn btn-primary btn-sm fixed top-3 left-3 z-[60] -translate-y-[150%] focus-visible:translate-y-0"
        >
          {dict.common.skipToContent}
        </a>
        <SiteHeader
          logo={<Logo className="h-full w-auto" />}
          locale={locale}
          navigation={navigation}
          labels={{
            ...dict.header,
            bookAppointment: dict.common.bookAppointment,
          }}
        />
        <main id="main" tabIndex={-1} className="pt-(--header-h) outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
