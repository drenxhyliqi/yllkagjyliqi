import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

import { PageIntro } from "@/components/layout/page-intro";
import { LocalBusinessData } from "@/components/seo/local-business-data";
import {
  CalendarIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
} from "@/components/ui/icons";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getBusinessInfo } from "@/lib/data/business";
import { groupOpeningHours } from "@/lib/hours";
import { directionsUrl } from "@/lib/maps";
import { getNavigation } from "@/lib/navigation";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { contactPage } = await getDictionary();
  return pageMetadata(await getLocale(), "/contact", {
    title: contactPage.title,
    description: contactPage.description,
  });
}

const valueClass = "font-display text-display-sm leading-snug lining-nums";

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-6">
      <dt className="eyebrow text-stone">{label}</dt>
      <dd className="mt-3 space-y-1.5">{children}</dd>
    </div>
  );
}

type QuickAction = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  external?: boolean;
};

export default async function ContactPage() {
  const locale = await getLocale();
  const [dict, business] = await Promise.all([
    getDictionary(),
    getBusinessInfo(),
  ]);
  const navigation = getNavigation(locale, dict);
  const copy = dict.contactPage;
  const hours = groupOpeningHours(business.hours, locale);
  const directions = directionsUrl(business);
  const tel = business.phone && `tel:${business.phone.replace(/[^\d+]/g, "")}`;

  const quickActions: QuickAction[] = [];
  if (tel) quickActions.push({ label: copy.call, href: tel, icon: PhoneIcon });
  if (business.instagram) {
    quickActions.push({
      label: "Instagram",
      href: business.instagram.url,
      icon: InstagramIcon,
      external: true,
    });
  }
  if (directions) {
    quickActions.push({
      label: copy.directions,
      href: directions,
      icon: MapPinIcon,
      external: true,
    });
  }
  quickActions.push({
    label: copy.book,
    href: navigation.booking,
    icon: CalendarIcon,
  });

  return (
    <>
      <LocalBusinessData business={business} locale={locale} />
      <PageIntro
        eyebrow={copy.eyebrow}
        titleStart={copy.titleStart}
        titleEmphasis={copy.titleEmphasis}
        text={copy.text}
      />

      {/* Phones: the four things people come here to do, one tap away. */}
      <nav aria-label={copy.quickActions} className="container-site lg:hidden">
        <ul className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, href, icon: Icon, external }) => (
            <li key={label}>
              {external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col items-start gap-6 border border-line p-5 transition-colors duration-300 active:bg-cream"
                >
                  <Icon className="size-6" />
                  <span className="text-label uppercase">{label}</span>
                </a>
              ) : (
                <Link
                  href={href}
                  className="flex h-full flex-col items-start gap-6 border border-line p-5 transition-colors duration-300 active:bg-cream"
                >
                  <Icon className="size-6" />
                  <span className="text-label uppercase">{label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <section className="container-site grid gap-x-8 pt-12 pb-24 lg:grid-cols-12 lg:pt-0 lg:pb-32">
        <dl className="reveal lg:col-span-5">
          {business.phone && tel && (
            <Detail label={copy.phone}>
              <a href={tel} className={`link-line ${valueClass}`}>
                {business.phone}
              </a>
            </Detail>
          )}
          {business.email && (
            <Detail label={copy.email}>
              <a
                href={`mailto:${business.email}`}
                className={`link-line ${valueClass}`}
              >
                {business.email}
              </a>
            </Detail>
          )}
          {(business.instagram || business.facebook) && (
            <Detail label={copy.social}>
              {business.instagram && (
                <p>
                  <a
                    href={business.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`link-line ${valueClass}`}
                  >
                    Instagram · @{business.instagram.handle}
                  </a>
                </p>
              )}
              {business.facebook && (
                <p>
                  <a
                    href={business.facebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`link-line ${valueClass}`}
                  >
                    Facebook
                  </a>
                </p>
              )}
            </Detail>
          )}
        </dl>

        <dl className="reveal lg:col-span-5 lg:col-start-8">
          {business.address && (
            <Detail label={copy.address}>
              <p className={valueClass}>
                {business.address.street}
                <br />
                {business.address.city}
              </p>
              {directions && (
                <p className="pt-3">
                  <a
                    href={directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-line text-label uppercase [--line-trim:0.16em]"
                  >
                    {dict.footer.directions}
                  </a>
                </p>
              )}
            </Detail>
          )}
          <Detail label={dict.footer.hours}>
            <ul className="space-y-2.5">
              {hours.map((row) => (
                <li
                  key={row.days}
                  className="flex items-baseline justify-between gap-6 border-b border-line pb-2.5 last:border-b-0"
                >
                  <span className="font-display text-[1.1875rem]">
                    {row.days}
                  </span>
                  <span className={row.time ? "tabular-nums" : "text-stone"}>
                    {row.time ?? dict.footer.closed}
                  </span>
                </li>
              ))}
            </ul>
          </Detail>
        </dl>
      </section>
    </>
  );
}
