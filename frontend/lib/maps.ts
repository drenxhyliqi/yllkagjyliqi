import type { BusinessInfo } from "@/types/business";

/**
 * Link that opens the address in the visitor's maps app. Uses the saved
 * Google Maps link when there is one, otherwise a Google Maps search for the
 * address. A link rather than an embedded map, which would load third-party
 * cookies before consent.
 */
export function directionsUrl(business: BusinessInfo): string | null {
  if (business.mapsUrl) return business.mapsUrl;
  if (!business.address) return null;
  const query = `${business.address.street}, ${business.address.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Google Maps search for any written address, e.g. a client's home. */
export function addressMapUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
