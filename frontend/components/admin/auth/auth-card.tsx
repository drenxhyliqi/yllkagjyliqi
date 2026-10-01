import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/ui/logo";

/** The quiet centred layout of the sign-in pages. */
export function AuthCard({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center px-(--gutter) py-16">
      <div className="w-full max-w-sm">
        <Link href="/" aria-label="Yllka" className="mx-auto block w-fit">
          <Logo className="h-10 w-auto" />
        </Link>
        <h1 className="mt-14 text-center text-display-md">{title}</h1>
        {text && <p className="mt-3 text-center text-stone">{text}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
