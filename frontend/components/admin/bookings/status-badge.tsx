import { statusLabel } from "@/lib/admin/booking-text";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

const styles: Record<BookingStatus, string> = {
  pending: "border-sand bg-sand text-ink",
  confirmed: "border-ink bg-ink text-paper",
  completed: "border-line text-stone",
  no_show: "border-error/40 text-error",
  declined: "border-line text-stone line-through decoration-stone/60",
  cancelled: "border-line text-stone line-through decoration-stone/60",
  expired: "border-line text-stone",
};

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 text-eyebrow tracking-[0.16em] whitespace-nowrap uppercase",
        styles[status],
        className,
      )}
    >
      {status === "pending" && (
        <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-ink" />
      )}
      {statusLabel(status)}
    </span>
  );
}
