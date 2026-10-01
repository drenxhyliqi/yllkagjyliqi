import "server-only";

import { headers } from "next/headers";

/** This site's own address as the visitor reached it, e.g. "https://yllka.com". */
export async function siteOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const proto =
    requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** The client's private page for a booking, in their language. */
export async function manageUrl(token: string, locale: "sq" | "en"): Promise<string> {
  return `${await siteOrigin()}/${locale}/booking/${token}`;
}
