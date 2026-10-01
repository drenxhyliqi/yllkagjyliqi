"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";

import { logout } from "@/app/admin/actions";
import {
  CalendarIcon,
  ExternalIcon,
  GridIcon,
  ImageIcon,
  InboxIcon,
  ListIcon,
  SignOutIcon,
  SlidersIcon,
} from "@/components/ui/icons";
import { adminText } from "@/i18n/admin";
import { cn } from "@/lib/utils";

type NavEntry = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** In the phone's bottom bar; the rest sit in the top bar. */
  tab: boolean;
};

const nav: NavEntry[] = [
  { href: "/admin", label: adminText.nav.dashboard, icon: GridIcon, tab: true },
  { href: "/admin/bookings", label: adminText.nav.bookings, icon: InboxIcon, tab: true },
  { href: "/admin/appointments", label: adminText.nav.appointments, icon: CalendarIcon, tab: true },
  { href: "/admin/services", label: adminText.nav.services, icon: ListIcon, tab: true },
  { href: "/admin/work", label: adminText.nav.work, icon: ImageIcon, tab: true },
  { href: "/admin/settings", label: adminText.nav.settings, icon: SlidersIcon, tab: false },
];

const tabs = nav.filter((entry) => entry.tab);

/** Small count of requests waiting, on the Rezervimet item. */
function Badge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      className={cn(
        "grid h-4.5 min-w-4.5 place-items-center rounded-full bg-ink px-1 text-[0.625rem] leading-none text-paper tabular-nums",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function isCurrent(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

type AdminShellProps = {
  /** Rendered on the server so the logo artwork stays out of the client bundle. */
  logo: ReactNode;
  adminName: string;
  /** Booking requests waiting for an answer. */
  pendingCount: number;
  children: ReactNode;
};

/*
 * Phones (most of the time): a slim top bar and a bottom tab bar within
 * thumb reach. Large screens: a sidebar with the same five sections.
 */
export function AdminShell({ logo, adminName, pendingCount, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* ——— Sidebar (large screens) ——— */}
      <aside className="hidden border-r border-line lg:block">
        <div className="sticky top-0 flex h-svh flex-col px-6 py-8">
          <Link href="/admin" aria-label={adminText.nav.dashboard} className="block h-9 w-fit">
            {logo}
          </Link>
          <nav aria-label={adminText.nav.label} className="mt-12">
            <ul className="space-y-1">
              {nav.map(({ href, label, icon: Icon }) => {
                const current = isCurrent(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "relative flex items-center gap-4 px-4 py-3 transition-colors duration-200",
                        current ? "bg-cream text-ink" : "text-ink/65 hover:bg-cream/60 hover:text-ink",
                      )}
                    >
                      {current && (
                        <span aria-hidden="true" className="absolute inset-y-2 left-0 w-px bg-ink" />
                      )}
                      <Icon className="size-5" />
                      <span>{label}</span>
                      {href === "/admin/bookings" && (
                        <Badge count={pendingCount} className="ml-auto" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto border-t border-line pt-6">
            <p className="font-display text-[1.25rem] leading-tight">{adminName}</p>
            <div className="mt-4 space-y-1 text-small">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 py-1.5 text-stone transition-colors hover:text-ink"
              >
                <ExternalIcon className="size-4" />
                {adminText.shell.viewSite}
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex cursor-pointer items-center gap-3 py-1.5 text-stone transition-colors hover:text-ink"
                >
                  <SignOutIcon className="size-4" />
                  {adminText.shell.signOut}
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* ——— Top bar (phones) ——— */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper px-(--gutter) lg:hidden">
          <Link href="/admin" aria-label={adminText.nav.dashboard} className="block h-7">
            {logo}
          </Link>
          <div className="-mr-2 flex items-center">
            <Link
              href="/admin/settings"
              aria-label={adminText.nav.settings}
              aria-current={isCurrent(pathname, "/admin/settings") ? "page" : undefined}
              className={cn(
                "grid size-11 place-items-center",
                isCurrent(pathname, "/admin/settings") ? "text-ink" : "text-ink/70",
              )}
            >
              <SlidersIcon className="size-5" />
            </Link>
            <Link
              href="/"
              target="_blank"
              aria-label={adminText.shell.viewSite}
              className="grid size-11 place-items-center text-ink/70"
            >
              <ExternalIcon className="size-5" />
            </Link>
            <form action={logout}>
              <button
                type="submit"
                aria-label={adminText.shell.signOut}
                className="grid size-11 cursor-pointer place-items-center text-ink/70"
              >
                <SignOutIcon className="size-5" />
              </button>
            </form>
          </div>
        </header>

        {/* Room for the bottom tab bar on phones. */}
        <main className="pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
      </div>

      {/* ——— Bottom tab bar (phones) ——— */}
      <nav
        aria-label={adminText.nav.label}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {tabs.map(({ href, label, icon: Icon }) => {
            const current = isCurrent(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "relative flex h-16 flex-col items-center justify-center gap-1.5 text-[0.6875rem] transition-colors duration-200",
                    current ? "text-ink" : "text-ink/50",
                  )}
                >
                  {current && (
                    <span aria-hidden="true" className="absolute inset-x-4 top-0 h-px bg-ink" />
                  )}
                  <span className="relative">
                    <Icon className="size-[1.375rem]" />
                    {href === "/admin/bookings" && (
                      <Badge count={pendingCount} className="absolute -top-1.5 -right-2.5" />
                    )}
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
