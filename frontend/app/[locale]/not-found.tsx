import Link from "next/link";

import { localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const locale = await getLocale();
  const { notFound } = await getDictionary();

  return (
    <section className="container-site flex min-h-[calc(100svh-var(--header-h))] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow text-stone">404</p>
      <h1 className="mt-6 text-display-lg">{notFound.title}</h1>
      <p className="mt-6 max-w-sm text-stone">{notFound.text}</p>
      <Link href={localizePath(locale, "/")} className="btn btn-outline mt-10">
        {notFound.back}
      </Link>
    </section>
  );
}
