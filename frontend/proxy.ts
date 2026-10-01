import { NextResponse, type NextRequest } from "next/server";

import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  locales,
  type Locale,
} from "@/i18n/config";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const ADMIN_LOGIN = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return guardAdmin(request);
  }

  const firstSegment = pathname.split("/")[1];
  if (isLocale(firstSegment)) return NextResponse.next();

  // No locale in the URL: send the visitor to their language.
  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

/**
 * Optimistic check only: a missing cookie goes straight to the login page.
 * The session itself is verified by the API on every admin request.
 */
/** Admin pages for people who aren't signed in (yet). */
const PUBLIC_ADMIN = [ADMIN_LOGIN, "/admin/forgot-password", "/admin/reset-password/"];

function guardAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const open = PUBLIC_ADMIN.some((path) =>
    path.endsWith("/") ? pathname.startsWith(path) : pathname === path,
  );
  if (open || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }
  const url = new URL(ADMIN_LOGIN, request.url);
  if (pathname !== "/admin") url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

/** Saved choice first, then the browser's languages, then Albanian. */
function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const accepted = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return {
        language: tag.split("-")[0].toLowerCase(),
        weight: q ? Number(q) : 1,
      };
    })
    .sort((a, b) => b.weight - a.weight);

  const match = accepted.find(({ language }) =>
    locales.includes(language as Locale),
  );
  return match ? (match.language as Locale) : defaultLocale;
}

export const config = {
  // Skip Next internals, API routes and any file with an extension.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
