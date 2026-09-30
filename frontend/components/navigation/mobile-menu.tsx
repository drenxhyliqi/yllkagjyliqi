import Link from "next/link";

import type { HeaderLabels } from "@/components/layout/site-header";
import { LanguageSwitcher } from "@/components/navigation/language-switcher";
import { UserIcon } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { ADMIN_LOGIN_PATH, isActivePath, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MobileMenuProps = {
  id: string;
  open: boolean;
  locale: Locale;
  pathname: string;
  items: NavItem[];
  bookingHref: string;
  labels: HeaderLabels;
  onNavigate: () => void;
};

/** Full-screen menu for phones and tablets. Open state is owned by the site header. */
export function MobileMenu({
  id,
  open,
  locale,
  pathname,
  items,
  bookingHref,
  labels,
  onNavigate,
}: MobileMenuProps) {
  return (
    <div
      id={id}
      inert={!open}
      className={cn(
        "fixed inset-0 overflow-y-auto overscroll-contain bg-sand text-ink transition-[opacity,visibility] duration-500 ease-soft lg:hidden",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div
        className={cn(
          "container-site flex min-h-full flex-col pt-[calc(var(--header-h)+clamp(1.5rem,7svh,4rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-transform duration-700 ease-soft",
          open ? "translate-y-0" : "translate-y-4",
        )}
      >
        <nav aria-label={labels.mainNav}>
          <ul>
            {items.map((item) => {
              const active = isActivePath(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className="-mx-1 block px-1 py-1.5 font-display text-[clamp(2.375rem,1.6rem+4vw,3.25rem)] leading-[1.15] aria-[current=page]:italic"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto pt-12">
          <Link
            href={bookingHref}
            onClick={onNavigate}
            className="btn btn-primary w-full"
          >
            {labels.bookAppointment}
          </Link>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-2">
            <LanguageSwitcher locale={locale} label={labels.language} />
            <Link
              href={ADMIN_LOGIN_PATH}
              aria-label={labels.adminLogin}
              className="-mr-2.5 flex size-11 items-center justify-center opacity-75"
            >
              <UserIcon className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
