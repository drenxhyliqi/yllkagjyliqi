import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatEuros } from "@/lib/format";
import type { Service } from "@/types/service";

/** One chosen service and for how many people, e.g. bridesmaid makeup × 3. */
export type Chosen = { slug: string; quantity: number };
export type ChosenService = { service: Service; quantity: number };

export const MAX_PEOPLE = 10;
export const MAX_SERVICES = 6;

export function resolveChosen(chosen: Chosen[], services: Service[]): ChosenService[] {
  return chosen.flatMap(({ slug, quantity }) => {
    const service = services.find((candidate) => candidate.slug === slug);
    return service ? [{ service, quantity }] : [];
  });
}

/** Everything one after another: one person, then the next. */
export function totalMinutes(items: ChosenService[]): number {
  return items.reduce((sum, { service, quantity }) => sum + (service.durationMinutes ?? 0) * quantity, 0);
}

/** "Bridesmaid makeup × 3" */
export function itemLabel({ service, quantity }: ChosenService): string {
  return quantity > 1 ? `${service.name} × ${quantity}` : service.name;
}

/** "€170", "from €170" or "On request", for everything together. */
export function totalPrice(
  items: ChosenService[],
  locale: Locale,
  pricing: Dictionary["pricing"],
): string {
  const priced = items.filter(({ service }) => service.priceType !== "on_request" && service.price !== null);
  if (priced.length === 0) return pricing.onRequest;
  const sum = priced.reduce((total, { service, quantity }) => total + (service.price ?? 0) * quantity, 0);
  const amount = formatEuros(Math.round(sum * 100) / 100, locale);
  const open = priced.length < items.length || priced.some(({ service }) => service.priceType === "from");
  return open ? `${pricing.from} ${amount}` : amount;
}

/** "id:3,id:1" for the availability request. */
export function itemsParam(items: ChosenService[]): string {
  return items.map(({ service, quantity }) => `${service.id}:${quantity}`).join(",");
}
