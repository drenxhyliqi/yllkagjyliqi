import Link from "next/link";

import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

/** A booking link that doesn't (or no longer) exist. */
export default async function BookingNotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <div className="container-site section-y">
      <div className="max-w-xl">
        <h1 className="text-display-md">{dict.managePage.notFoundTitle}</h1>
        <p className="mt-4 text-stone">{dict.managePage.notFoundText}</p>
        <Link href={localizePath(locale, "/contact")} className="btn btn-outline mt-8">
          {dict.nav.contact}
        </Link>
      </div>
    </div>
  );
}
