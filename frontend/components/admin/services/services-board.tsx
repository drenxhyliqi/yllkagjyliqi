"use client";

import Link from "next/link";
import { useState } from "react";

import { reorderCategories, reorderServices } from "@/app/admin/(panel)/services/actions";
import { ErrorLine, HiddenBadge, useOrder } from "@/components/admin/list-tools";
import { MoveButtons } from "@/components/admin/move-buttons";
import { ArrowRightIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { durationLabel, priceLabel } from "@/lib/admin/format";
import { cn } from "@/lib/utils";
import type { AdminCategory, AdminService } from "@/types/admin-content";

const text = adminText.services;

function ServiceRows({ category, reordering }: { category: AdminCategory; reordering: boolean }) {
  const { order, move, error } = useOrder<AdminService>(category.services, (ids) =>
    reorderServices(category.id, ids),
  );

  if (order.length === 0) {
    return <p className="border-t border-line py-5 text-small text-stone">{text.emptyCategory}</p>;
  }

  return (
    <>
      <ul className="border-t border-line">
        {order.map((service, index) => {
          const details = [
            priceLabel(service),
            service.duration_minutes ? durationLabel(service.duration_minutes) : null,
          ].filter(Boolean);
          const body = (
            <span className="min-w-0">
              <span
                className={cn(
                  "flex flex-wrap items-center gap-x-3 gap-y-1",
                  !service.is_active && "text-stone",
                )}
              >
                <span className="leading-snug">{service.name_sq}</span>
                {!service.is_active && <HiddenBadge />}
              </span>
              <span className="mt-0.5 block text-small text-stone tabular-nums">
                {details.join(" · ")}
              </span>
            </span>
          );
          return (
            <li key={service.id} className="border-b border-line">
              {reordering ? (
                <div className="flex min-h-16 items-center justify-between gap-4 py-2">
                  {body}
                  <MoveButtons
                    name={service.name_sq}
                    first={index === 0}
                    last={index === order.length - 1}
                    onMove={(delta) => move(index, delta)}
                  />
                </div>
              ) : (
                <Link
                  href={`/admin/services/${service.id}`}
                  className="group flex min-h-16 items-center justify-between gap-4 py-3 transition-colors hover:bg-cream/50"
                >
                  {body}
                  <ArrowRightIcon className="w-4 shrink-0 text-stone transition-transform duration-300 ease-soft group-hover:translate-x-1 group-hover:text-ink" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <ErrorLine message={error} />
    </>
  );
}

export function ServicesBoard({ catalog }: { catalog: AdminCategory[] }) {
  const [reordering, setReordering] = useState(false);
  const { order, move, error } = useOrder(catalog, reorderCategories);

  if (order.length === 0) {
    return (
      <div className="border-y border-line py-12 text-center">
        <p className="font-display text-display-sm">{text.emptyTitle}</p>
        <p className="mx-auto mt-3 max-w-sm text-stone">{text.emptyText}</p>
        <Link href="/admin/services/categories/new" className="btn btn-primary mt-8">
          {text.newCategory}
        </Link>
      </div>
    );
  }

  return (
    <div>
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
      <ErrorLine message={error} />

      <div className="mt-6 space-y-12">
        {order.map((category, index) => (
          <section key={category.id} aria-labelledby={`category-${category.id}`}>
            <div className="flex items-end justify-between gap-4 pb-4">
              <div className="min-w-0">
                <h2
                  id={`category-${category.id}`}
                  className={cn(
                    "flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-display-sm",
                    !category.is_active && "text-stone",
                  )}
                >
                  {category.name_sq}
                  {!category.is_active && <HiddenBadge />}
                </h2>
                <p className="mt-1 text-small text-stone">{text.count(category.services.length)}</p>
              </div>
              {reordering ? (
                <MoveButtons
                  name={category.name_sq}
                  first={index === 0}
                  last={index === order.length - 1}
                  onMove={(delta) => move(index, delta)}
                />
              ) : (
                <Link
                  href={`/admin/services/categories/${category.id}`}
                  className="-mr-2 inline-flex min-h-11 shrink-0 items-center px-2 text-small underline underline-offset-4"
                >
                  {text.editCategory}
                  <span className="sr-only">: {category.name_sq}</span>
                </Link>
              )}
            </div>

            <ServiceRows
              // Start fresh when the server sends a new order.
              key={category.services.map((service) => service.id).join()}
              category={category}
              reordering={reordering}
            />

            {!reordering && (
              <Link
                href={`/admin/services/new?category=${category.id}`}
                className="mt-2 inline-flex min-h-11 items-center gap-2 text-small text-stone transition-colors hover:text-ink"
              >
                <span aria-hidden="true" className="text-lead leading-none">
                  +
                </span>
                {text.addService}
                <span className="sr-only">: {category.name_sq}</span>
              </Link>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
