import Link from "next/link";

import { ArrowRightIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";

/** Red call to action when bookings overlap and Yllka has to choose. */
export function ConflictBanner({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <Link
      href="/admin/bookings"
      className={`group flex min-h-14 items-center justify-between gap-4 border border-error bg-error/[0.06] px-5 py-3 text-error ${className ?? ""}`}
    >
      <span className="flex items-center gap-3">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-error" />
        <span>
          {adminText.bookings.conflictCount(count)}
          <span className="mt-0.5 block text-small text-error/80">
            {adminText.bookings.detail.conflictText}
          </span>
        </span>
      </span>
      <ArrowRightIcon className="w-5 shrink-0 transition-transform duration-300 ease-soft group-hover:translate-x-1" />
    </Link>
  );
}
