import { localizePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

export type NavItem = {
  label: string;
  href: string;
  /** Active only on this exact path (the homepage), not on pages below it. */
  exact?: boolean;
};

type NavKey = keyof Dictionary["nav"];

const paths: Record<NavKey, string> = {
  home: "/",
  services: "/services",
  work: "/work",
  prices: "/prices",
  about: "/about",
  contact: "/contact",
};

/** Main site sections, shown in the header on desktop. */
const primaryKeys: NavKey[] = ["home", "services", "work", "prices", "about"];
/** The mobile menu adds Contact, since the footer is far away on a phone. */
const mobileKeys: NavKey[] = [...primaryKeys, "contact"];

export const ADMIN_LOGIN_PATH = "/admin/login";

export function getNavigation(locale: Locale, dict: Dictionary) {
  const toItem = (key: NavKey): NavItem => ({
    label: dict.nav[key],
    href: localizePath(locale, paths[key]),
    exact: key === "home",
  });

  return {
    home: localizePath(locale, "/"),
    booking: localizePath(locale, "/book"),
    work: localizePath(locale, paths.work),
    about: localizePath(locale, paths.about),
    primary: primaryKeys.map(toItem),
    mobile: mobileKeys.map(toItem),
  };
}

export function isActivePath(pathname: string, { href, exact }: NavItem): boolean {
  return pathname === href || (!exact && pathname.startsWith(`${href}/`));
}
