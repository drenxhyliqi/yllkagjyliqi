"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { reorderWork } from "@/app/admin/(panel)/work/actions";
import { ErrorLine, HiddenBadge, useOrder } from "@/components/admin/list-tools";
import { MoveButtons } from "@/components/admin/move-buttons";
import { adminText } from "@/i18n/admin";
import { cn } from "@/lib/utils";
import type { AdminWork } from "@/types/admin-content";

const text = adminText.work;

type WorkGridProps = {
  items: AdminWork[];
  /** Category id → name. */
  categories: Record<string, string>;
};

export function WorkGrid({ items, categories }: WorkGridProps) {
  const [reordering, setReordering] = useState(false);
  const { order, move, error } = useOrder(items, reorderWork);

  if (order.length === 0) {
    return (
      <div className="border-y border-line py-12 text-center">
        <p className="font-display text-display-sm">{text.emptyTitle}</p>
        <p className="mx-auto mt-3 max-w-sm text-stone">{text.emptyText}</p>
        <Link href="/admin/work/new" className="btn btn-primary mt-8">
          {text.add}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {order.length > 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setReordering((value) => !value)}
            aria-pressed={reordering}
            className={cn("btn btn-sm", reordering ? "btn-primary" : "btn-outline")}
          >
            {reordering ? adminText.common.reorderDone : adminText.common.reorder}
          </button>
        </div>
      )}
      <ErrorLine message={error} />

      <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5">
        {order.map((item, index) => {
          const cover = item.images[0];
          const category = item.category_id ? categories[item.category_id] : null;
          const card = (
            <>
              <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                {cover && (
                  <Image
                    src={cover.url}
                    alt=""
                    fill
                    sizes="(min-width: 64rem) 16rem, (min-width: 40rem) 30vw, 46vw"
                    className={cn(
                      "object-cover transition-transform duration-[900ms] ease-soft",
                      !reordering && "group-hover:scale-[1.03]",
                      !item.is_published && "opacity-50 grayscale",
                    )}
                  />
                )}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                  {item.is_featured && (
                    <span className="bg-ink px-2 py-0.5 text-eyebrow tracking-[0.18em] text-paper uppercase">
                      {text.featured}
                    </span>
                  )}
                  {!item.is_published && (
                    <span className="bg-paper">
                      <HiddenBadge />
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 font-display text-[1.1875rem] leading-snug">{item.title_sq}</p>
              <p className="mt-0.5 text-small text-stone">
                {category ?? text.noCategory}
                {item.images.length > 1 && ` · ${text.photos(item.images.length)}`}
              </p>
            </>
          );
          return (
            <li key={item.id}>
              {reordering ? (
                <div>
                  {card}
                  <MoveButtons
                    className="mt-2"
                    name={item.title_sq}
                    direction="horizontal"
                    first={index === 0}
                    last={index === order.length - 1}
                    onMove={(delta) => move(index, delta)}
                  />
                </div>
              ) : (
                <Link href={`/admin/work/${item.id}`} className="group block">
                  {card}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
