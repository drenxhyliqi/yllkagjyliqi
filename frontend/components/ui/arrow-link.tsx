import Link from "next/link";
import type { ReactNode } from "react";

import { ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Quiet text link with a hairline arrow, e.g. "View work →". */
export function ArrowLink({ href, children, className }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 text-label uppercase",
        className,
      )}
    >
      <span className="link-line [--line-trim:0.16em] group-hover:[background-size:calc(100%-0.16em)_1px]">
        {children}
      </span>
      <ArrowRightIcon className="w-5 transition-transform duration-300 ease-soft group-hover:translate-x-1" />
    </Link>
  );
}
