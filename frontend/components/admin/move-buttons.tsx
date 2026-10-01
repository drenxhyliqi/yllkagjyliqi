"use client";

import { ArrowUpIcon } from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { cn } from "@/lib/utils";

type MoveButtonsProps = {
  /** What is being moved, for screen readers: "Move up: Blow-dry". */
  name: string;
  onMove: (delta: -1 | 1) => void;
  first: boolean;
  last: boolean;
  /** "horizontal" for grids, where earlier is to the left. */
  direction?: "vertical" | "horizontal";
  className?: string;
};

const button =
  "grid size-11 cursor-pointer place-items-center border border-line bg-paper text-ink transition-colors hover:border-ink disabled:cursor-default disabled:opacity-30 disabled:hover:border-line";

export function MoveButtons({ name, onMove, first, last, direction = "vertical", className }: MoveButtonsProps) {
  const horizontal = direction === "horizontal";
  return (
    <div className={cn("flex shrink-0 gap-1.5", className)}>
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={first}
        aria-label={`${horizontal ? adminText.upload.moveLeft : adminText.common.moveUp}: ${name}`}
        className={button}
      >
        <ArrowUpIcon className={cn("size-4", horizontal && "-rotate-90")} />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={last}
        aria-label={`${horizontal ? adminText.upload.moveRight : adminText.common.moveDown}: ${name}`}
        className={button}
      >
        <ArrowUpIcon className={cn("size-4", horizontal ? "rotate-90" : "rotate-180")} />
      </button>
    </div>
  );
}

/** Returns a copy of `list` with the item at `index` moved by `delta`. */
export function moved<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
