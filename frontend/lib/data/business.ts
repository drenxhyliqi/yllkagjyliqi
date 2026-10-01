import "server-only";

import { demoBusinessInfo } from "@/lib/demo/business";
import type { BusinessInfo } from "@/types/business";

/**
 * Contact details and opening hours.
 *
 * Returns demo data for now. When the settings API exists this becomes an
 * `apiFetch` call; callers and components stay the same.
 */
export async function getBusinessInfo(): Promise<BusinessInfo> {
  return demoBusinessInfo;
}
