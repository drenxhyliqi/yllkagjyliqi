import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "@/components/ui/icons";

type AdminPageProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  /** A "back to the list" link above the title, for edit pages. */
  back?: { href: string; label: string };
  /** Buttons next to the title on large screens, below it on phones. */
  actions?: ReactNode;
  children: ReactNode;
};

/** Standard admin page: heading, short intro, then sections. */
export function AdminPage({ eyebrow, title, intro, back, actions, children }: AdminPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-(--gutter) pt-6 pb-12 lg:px-12 lg:pt-14">
      {back && (
        <Link
          href={back.href}
          className="group -ml-1 inline-flex min-h-11 items-center gap-3 px-1 text-label text-stone uppercase transition-colors hover:text-ink"
        >
          <ArrowRightIcon className="w-5 rotate-180 transition-transform duration-300 ease-soft group-hover:-translate-x-1" />
          {back.label}
        </Link>
      )}
      <div
        className={
          actions ? "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" : undefined
        }
      >
        <div className={back ? "mt-3" : "mt-2"}>
          {eyebrow && <p className="eyebrow mb-4 text-stone">{eyebrow}</p>}
          <h1 className="text-display-md">{title}</h1>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {intro && <p className="mt-3 max-w-xl text-stone">{intro}</p>}
      <div className="mt-10">{children}</div>
    </div>
  );
}

type AdminSectionProps = {
  title: string;
  text?: string;
  children: ReactNode;
};

/** A titled block within an admin page, separated by a hairline. */
export function AdminSection({ title, text, children }: AdminSectionProps) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0 lg:py-10">
      <h2 className="font-display text-display-sm">{title}</h2>
      {text && <p className="mt-2 text-small text-stone">{text}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
