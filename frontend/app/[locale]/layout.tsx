import type { Metadata, Viewport } from "next";

import { fontVariables } from "@/app/fonts";
import { BackToTop } from "@/components/layout/back-to-top";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { RevealObserver } from "@/components/layout/reveal-observer";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { InlineScript } from "@/components/ui/inline-script";
import { Logo } from "@/components/ui/logo";
import { AnnouncementBar } from "@/components/grand-opening/announcement-bar";
import { locales } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getBusinessInfo } from "@/lib/data/business";
import { INTRO_STORAGE_KEY } from "@/lib/intro";
import { getNavigation } from "@/lib/navigation";
import { SITE_URL } from "@/lib/seo";
import { openingPhase } from "@/lib/grand-opening";

import "../globals.css";

// Only the configured locales exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: dict.meta.title, template: "%s — Yllka" },
    description: dict.meta.description,
    applicationName: "Yllka",
    formatDetection: { telephone: false, email: false, address: false },
  };
}

/*
 * Runs before first paint: tells the CSS that JavaScript is available (so
 * scroll reveals may start hidden) and decides whether the intro loader
 * plays: once per browser session.
 */
const bootScript = `(function(){var r=document.documentElement;r.setAttribute("data-js","");var k=${JSON.stringify(INTRO_STORAGE_KEY)},s="play";if(!/^\\/(sq|en)\\/?$/.test(location.pathname))s="seen";else try{if(sessionStorage.getItem(k))s="seen";else sessionStorage.setItem(k,"1")}catch(e){}window.__yllkaIntro=s;r.setAttribute("data-intro",s)})()`;

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const [dict, business] = await Promise.all([
    getDictionary(),
    getBusinessInfo(),
  ]);
  const navigation = getNavigation(locale, dict);

  // Rendered ahead of time; the bar itself keeps the phase up to date.
  // eslint-disable-next-line react-hooks/purity
  const phase = openingPhase(Date.now());
  const openingBar = phase !== "over";

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      data-announce={openingBar ? "" : undefined}
      className={fontVariables}
      // The boot script adds attributes before React hydrates.
      suppressHydrationWarning
    >
      <body>
        {/* First in <body> (not <head>): Next leaves layout <head> content out
            of the HTML on not-found responses, so a head script would not run there.
            Still runs before anything below it is painted. */}
        <InlineScript html={bootScript} />
        <div className="intro-loader" aria-hidden="true">
          <div className="intro-loader__inner">
            <Logo className="intro-loader__mark w-auto" />
            <span className="intro-loader__line" />
          </div>
        </div>
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
          announcement={
            openingBar && (
              <AnnouncementBar
                copy={dict.grandOpening.bar}
                offersHref={`${navigation.home}#oferta`}
                bookHref={navigation.booking}
                initialPhase={phase}
              />
            )
          }
        />
        <main id="main" tabIndex={-1} className="pt-(--header-h) outline-none">
          {children}
        </main>
        <SiteFooter
          locale={locale}
          navigation={navigation}
          business={business}
          copy={dict.footer}
          labels={{
            home: dict.header.home,
            bookAppointment: dict.common.bookAppointment,
            language: dict.header.language,
          }}
        />
        <BackToTop label={dict.common.backToTop} />
        <CookieConsent
          copy={dict.consent}
          policyHref={
            navigation.legal.find((item) => item.slug === "cookies")!.href
          }
        />
        <RevealObserver />
      </body>
    </html>
  );
}
