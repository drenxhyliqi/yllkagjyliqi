"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore, type CSSProperties } from "react";

import type { PortfolioItem } from "@/types/portfolio";

type WorkGalleryProps = {
  items: (PortfolioItem & { href: string })[];
  categories: { slug: string; label: string }[];
  copy: { filterLabel: string; all: string };
};

const ALL = "all";
const PARAM = "category";

/*
 * The selected category lives in the URL (?category=hair), read through
 * useSyncExternalStore: shared links work, back/forward works, and the
 * static HTML (always "all") hydrates without a mismatch.
 */
const urlListeners = new Set<() => void>();

function subscribeToUrl(onChange: () => void) {
  urlListeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    urlListeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

const readCategory = () =>
  new URLSearchParams(window.location.search).get(PARAM) ?? ALL;
const readServerCategory = () => ALL;

/** Keep each photo's own shape, within limits, so the columns stay calm. */
function aspectRatio(item: PortfolioItem): string {
  const { width, height } = item.cover;
  if (!width || !height) return "4 / 5";
  const ratio = Math.min(Math.max(width / height, 0.72), 1.3);
  return `${ratio}`;
}

/*
 * Filterable portfolio. Filtering happens in the browser, so switching is
 * instant.
 */
export function WorkGallery({ items, categories, copy }: WorkGalleryProps) {
  const requested = useSyncExternalStore(
    subscribeToUrl,
    readCategory,
    readServerCategory,
  );
  // Unknown categories in the URL fall back to everything.
  const active = categories.some((category) => category.slug === requested)
    ? requested
    : ALL;

  const choose = (slug: string) => {
    const url = new URL(window.location.href);
    if (slug === ALL) url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, slug);
    window.history.replaceState(window.history.state, "", url);
    urlListeners.forEach((notify) => notify());
  };

  const filters = [
    { slug: ALL, label: copy.all, count: items.length },
    ...categories
      .map((category) => ({
        ...category,
        count: items.filter((item) => item.category?.slug === category.slug)
          .length,
      }))
      .filter((category) => category.count > 0),
  ];
  const visible =
    active === ALL
      ? items
      : items.filter((item) => item.category?.slug === active);

  return (
    <div className="container-site pb-24 lg:pb-32">
      <div
        role="group"
        aria-label={copy.filterLabel}
        className="flex flex-wrap gap-x-6 gap-y-3 border-b border-line pb-5 sm:gap-x-8"
      >
        {filters.map((filter) => (
          <button
            key={filter.slug}
            type="button"
            aria-pressed={active === filter.slug}
            onClick={() => choose(filter.slug)}
            className="link-line cursor-pointer text-label uppercase opacity-55 transition-opacity duration-300 [--line-trim:0.16em] hover:opacity-100 aria-pressed:opacity-100 aria-pressed:[background-size:calc(100%-0.16em)_1px]"
          >
            {filter.label}
            <sup className="ml-1 text-[0.625rem] tracking-normal tabular-nums">
              {filter.count}
            </sup>
          </button>
        ))}
      </div>

      {/* Keyed by filter so items re-mount and fade in on every change. */}
      <ul
        key={active}
        className="mt-12 columns-1 gap-x-6 sm:columns-2 lg:mt-16 lg:columns-3 lg:gap-x-8"
      >
        {visible.map((item, index) => (
          <li
            key={item.id}
            className="gallery-item mb-12 break-inside-avoid lg:mb-14"
            style={{ "--i": index } as CSSProperties}
          >
            <Link href={item.href} className="group block">
              <div
                className="relative overflow-hidden bg-sand"
                style={{ aspectRatio: aspectRatio(item) }}
              >
                <Image
                  src={item.cover.src}
                  alt={item.cover.alt}
                  fill
                  sizes="(min-width: 64rem) 31vw, (min-width: 40rem) 48vw, 100vw"
                  style={{ objectPosition: item.cover.focalPoint }}
                  className="object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className="font-display text-[1.375rem] leading-snug">
                  {item.title}
                </h2>
                {item.category && (
                  <p className="eyebrow text-stone">{item.category.name}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
