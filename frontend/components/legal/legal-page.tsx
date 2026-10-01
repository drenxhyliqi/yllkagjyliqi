import Link from "next/link";

import { RevealLines } from "@/components/ui/reveal-lines";
import type { Locale } from "@/i18n/config";
import { formatFullDate } from "@/lib/dates";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { LegalBlock, LegalDocument } from "@/lib/legal/types";
import type { LegalSlug, NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type LegalPageProps = {
  locale: Locale;
  slug: LegalSlug;
  document: LegalDocument;
  updated: string;
  links: (NavItem & { slug: LegalSlug })[];
  copy: Dictionary["legal"];
};

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return <p>{block}</p>;
  }
  if ("list" in block) {
    return (
      <ul className="space-y-2.5">
        {block.list.map((item) => (
          <li key={item} className="relative pl-6">
            <span
              aria-hidden="true"
              className="absolute top-[0.85em] left-0 h-px w-3 bg-ink/40"
            />
            {item}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-small">
        <thead>
          <tr className="border-b border-ink/25">
            {block.table.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="eyebrow py-3 pr-6 font-medium whitespace-nowrap text-stone"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row) => (
            <tr key={row[0]} className="border-b border-line align-top">
              {row.map((cell, index) => (
                <td
                  key={index}
                  className={cn(
                    "py-4 pr-6",
                    (index === 0 || index === row.length - 1) &&
                      "whitespace-nowrap",
                    index === 0 && "font-medium",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalPage({
  locale,
  slug,
  document,
  updated,
  links,
  copy,
}: LegalPageProps) {
  const [year, month, day] = updated.split("-").map(Number);
  const updatedLabel = formatFullDate(new Date(year, month - 1, day), locale);

  return (
    <article className="container-site section-y">
      <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
        <nav aria-label={copy.eyebrow} className="lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            <p className="eyebrow text-stone">{copy.eyebrow}</p>
            <ul className="nav-list mt-5 flex flex-wrap gap-x-6 gap-y-2 lg:flex-col lg:gap-y-3">
              {links.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={link.href}
                    aria-current={link.slug === slug ? "page" : undefined}
                    className="nav-current font-display text-[1.1875rem] [--marker-gap:0.75rem] [--marker-width:1.25rem]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 lg:col-span-7 lg:col-start-5">
          <h1 className="reveal-lines text-display-lg">
            <RevealLines lines={[document.title]} />
          </h1>
          <p className="mt-5 text-small text-stone">
            {copy.updated} <time dateTime={updated}>{updatedLabel}</time>
          </p>
          <p className="reveal mt-10 text-lead">{document.intro}</p>

          <div className="mt-6 text-ink/85">
            {document.sections.map((section, index) => (
              <section
                key={section.heading}
                className="mt-14 border-t border-line pt-10"
              >
                <h2 className="text-display-sm">
                  <span className="mr-3 font-sans text-label text-stone tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <div className="mt-5 max-w-[65ch] space-y-4">
                  {section.blocks.map((block, blockIndex) => (
                    <Block key={blockIndex} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
