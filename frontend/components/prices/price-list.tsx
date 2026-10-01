import { NoBreakHyphens } from "@/components/ui/no-break-hyphens";
import { RevealLines } from "@/components/ui/reveal-lines";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatDuration, formatPrice } from "@/lib/format";
import type { CategoryWithServices } from "@/types/service";

type PriceListProps = {
  catalog: CategoryWithServices[];
  locale: Locale;
  pricing: Dictionary["pricing"];
};

/*
 * An editorial price list rather than a table: each category under a strong
 * rule, names joined to prices by a fine dotted leader, two columns on large
 * screens.
 */
export function PriceList({ catalog, locale, pricing }: PriceListProps) {
  return (
    <div className="container-site grid gap-x-20 gap-y-16 pb-24 lg:grid-cols-2 lg:gap-y-24 lg:pb-32">
      {catalog
        .filter((category) => category.services.length > 0)
        .map((category) => {
          const titleId = `prices-${category.slug}`;
          return (
            <section key={category.id} aria-labelledby={titleId}>
              <h2
                id={titleId}
                className="reveal-lines border-b border-ink pb-4 text-display-md"
              >
                <RevealLines lines={[category.name]} />
              </h2>
              <ul className="mt-2">
                {category.services.map((service) => (
                  <li
                    key={service.id}
                    className="reveal flex items-baseline gap-4 py-3.5"
                  >
                    <p className="min-w-0">
                      <span className="font-display text-[1.25rem] leading-snug">
                        <NoBreakHyphens text={service.name} />
                      </span>
                      {service.durationMinutes !== null && (
                        <span className="mt-0.5 block text-small whitespace-nowrap text-stone sm:mt-0 sm:ml-3 sm:inline">
                          {formatDuration(service.durationMinutes, pricing)}
                        </span>
                      )}
                    </p>
                    <span
                      aria-hidden="true"
                      className="min-w-6 flex-1 -translate-y-1 border-b border-dotted border-ink/30"
                    />
                    <p className="font-display text-[1.25rem] whitespace-nowrap lining-nums">
                      {formatPrice(service, locale, pricing)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
    </div>
  );
}
