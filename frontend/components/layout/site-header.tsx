"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { UserIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import {
  ADMIN_LOGIN_PATH,
  isActivePath,
  type getNavigation,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

const MENU_ID = "mobile-menu";
const SCROLL_THRESHOLD = 16;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
const getServerScrolled = () => false;

export type HeaderLabels = Dictionary["header"] & { bookAppointment: string };

type SiteHeaderProps = {
  /** Rendered on the server and passed in, so the logo artwork stays out of the client bundle. */
  logo: ReactNode;
  locale: Locale;
  navigation: ReturnType<typeof getNavigation>;
  labels: HeaderLabels;
};

export function SiteHeader({
  logo,
  locale,
  navigation,
  labels,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrolled,
    getServerScrolled,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPathname, setMenuPathname] = useState(pathname);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu on any route change, including browser back/forward.
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  // The homepage opens on a dark full-bleed photograph: until the visitor
  // scrolls, the header floats over it with light text and no background.
  const overlay = pathname === navigation.home && !scrolled && !menuOpen;

  useEffect(() => {
    if (!menuOpen) return;

    const header = headerRef.current;
    const root = document.documentElement;

    // The open menu covers the page, so everything outside the header is made
    // inert: focus and screen readers stay inside the menu until it closes.
    const outside = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && header !== null && !el.contains(header),
    );
    outside.forEach((el) => (el.inert = true));
    root.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpointChange);

    return () => {
      outside.forEach((el) => (el.inert = false));
      root.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpointChange);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "relative z-10 border-b transition-[background-color,border-color,color] duration-500 ease-soft",
          // Opaque everywhere except over the hero, so page content never
          // shows through mid-transition.
          menuOpen
            ? "border-transparent bg-sand text-ink"
            : overlay
              ? "border-transparent bg-transparent text-paper"
              : scrolled
                ? "border-line bg-paper text-ink"
                : "border-transparent bg-paper text-ink",
        )}
      >
        <div
          className={cn(
            "container-site grid h-18 grid-cols-[1fr_auto] items-center gap-6 transition-[height] duration-500 ease-soft lg:flex lg:justify-between",
            scrolled ? "lg:h-18" : "lg:h-22",
          )}
        >
          <Link
            href={navigation.home}
            aria-label={labels.home}
            className="justify-self-start"
          >
            <span
              className={cn(
                "block h-8 origin-left transition-transform duration-500 ease-soft lg:h-10",
                scrolled && "lg:scale-[0.85]",
              )}
            >
              {logo}
            </span>
          </Link>

          {/* justify-between leaves equal space either side of the links. */}
          <nav aria-label={labels.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-10">
              {navigation.primary.map((item) => {
                const active = isActivePath(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="link-line text-label whitespace-nowrap uppercase opacity-75 transition-opacity duration-300 [--line-trim:0.16em] hover:opacity-100 aria-[current=page]:opacity-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-4 justify-self-end sm:gap-6 lg:gap-3 xl:gap-5">
            <LanguageSwitcher
              locale={locale}
              label={labels.language}
              className="hidden lg:flex"
            />
            <Link
              href={ADMIN_LOGIN_PATH}
              aria-label={labels.adminLogin}
              title={labels.adminLogin}
              className="hidden size-10 items-center justify-center opacity-75 transition-opacity duration-300 hover:opacity-100 lg:flex"
            >
              <UserIcon className="size-5" />
            </Link>
            <Link
              href={navigation.booking}
              aria-label={labels.book}
              className={cn(
                "btn btn-sm",
                overlay ? "btn-light" : "btn-outline",
                menuOpen && "invisible opacity-0",
              )}
            >
              {/* Short label until there is room for five links and the full label. */}
              <span className="xl:hidden">{labels.bookShort}</span>
              <span className="hidden xl:inline">{labels.book}</span>
            </Link>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={() => setMenuOpen((open) => !open)}
              className="-mr-2 flex h-11 cursor-pointer items-center gap-3 px-2 text-label uppercase lg:hidden"
            >
              <span className="min-w-[3.5em] text-right">
                {menuOpen ? labels.close : labels.menu}
              </span>
              <span aria-hidden="true" className="relative block h-2.5 w-6">
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-soft",
                    menuOpen && "translate-y-[4.5px] rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-soft",
                    menuOpen && "-translate-y-[4.5px] -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        id={MENU_ID}
        open={menuOpen}
        locale={locale}
        pathname={pathname}
        items={navigation.mobile}
        bookingHref={navigation.booking}
        labels={labels}
        onNavigate={() => setMenuOpen(false)}
      />
    </header>
  );
}
