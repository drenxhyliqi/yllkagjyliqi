import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";

import { ArrowLink } from "@/components/ui/arrow-link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { RevealLines } from "@/components/ui/reveal-lines";
import { isLocale, localizePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getPortfolio, getPortfolioItem } from "@/lib/data/portfolio";
import { getNavigation } from "@/lib/navigation";

export async function generateStaticParams() {
  const locale = await localeParam();
  if (!isLocale(locale)) return [];
  return (await getPortfolio(locale)).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItem(await getLocale(), slug);
  if (!item) return {};
  return { title: item.title, description: item.description ?? undefined };
}

export default async function WorkItemPage({
  params,
}: PageProps<"/[locale]/work/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const [dict, items] = await Promise.all([
    getDictionary(),
    getPortfolio(locale),
  ]);
  const item = items.find((candidate) => candidate.slug === slug);
  if (!item) notFound();

  const copy = dict.workPage;
  const navigation = getNavigation(locale, dict);
  // Same category first, then the rest, never the current piece.
  const more = [
    ...items.filter(
      (other) =>
        other.slug !== slug && other.category.slug === item.category.slug,
    ),
    ...items.filter(
      (other) =>
        other.slug !== slug && other.category.slug !== item.category.slug,
    ),
  ].slice(0, 3);

  return (
    <article>
      <div className="container-site pt-10 lg:pt-16">
        <Link
          href={navigation.work}
          className="group inline-flex items-center gap-3 text-label uppercase"
        >
          <ArrowRightIcon className="w-5 rotate-180 transition-transform duration-300 ease-soft group-hover:-translate-x-1" />
          <span className="link-line [--line-trim:0.16em] group-hover:[background-size:calc(100%-0.16em)_1px]">
            {copy.back}
          </span>
        </Link>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="reveal relative aspect-[4/5] overflow-hidden bg-sand lg:col-span-7">
            <Image
              src={item.cover.src}
              alt={item.cover.alt}
              fill
              preload
              sizes="(min-width: 64rem) 55vw, 100vw"
              style={{ objectPosition: item.cover.focalPoint }}
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-4 lg:col-start-9 lg:pb-4">
            <p className="eyebrow text-stone">{item.category.name}</p>
            <h1 className="reveal-lines mt-6 text-display-lg">
              <RevealLines lines={[item.title]} />
            </h1>
            {item.description && (
              <p className="reveal mt-6 text-lead text-stone">
                {item.description}
              </p>
            )}
            <Link
              href={localizePath(locale, `/book`)}
              className="btn btn-primary mt-10 w-full sm:w-auto"
            >
              {copy.bookSimilar}
            </Link>
          </div>
        </div>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-work" className="section-y">
          <div className="container-site">
            <div className="flex items-end justify-between gap-8 border-t border-line pt-10">
              <h2 id="more-work" className="reveal-lines text-display-md">
                <RevealLines lines={[copy.more]} />
              </h2>
              <div className="mb-2 hidden shrink-0 sm:block">
                <ArrowLink href={navigation.work}>{copy.back}</ArrowLink>
              </div>
            </div>
            <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-3 lg:gap-x-8">
              {more.map((other) => (
                <li key={other.id} className="reveal">
                  <Link
                    href={localizePath(locale, `/work/${other.slug}`)}
                    className="group block"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                      <Image
                        src={other.cover.src}
                        alt={other.cover.alt}
                        fill
                        sizes="(min-width: 40rem) 31vw, 100vw"
                        style={{ objectPosition: other.cover.focalPoint }}
                        className="object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="font-display text-[1.375rem] leading-snug">
                        {other.title}
                      </h3>
                      <p className="eyebrow text-stone">
                        {other.category.name}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
