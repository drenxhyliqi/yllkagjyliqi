import "server-only";

import { cache } from "react";

import { contentTags } from "@/lib/content-tags";
import { publicFetch } from "@/lib/data/public-api";
import type { BusinessInfo, OpeningHours } from "@/types/business";

type ApiBusiness = Omit<BusinessInfo, "mapsUrl" | "hours"> & {
  maps_url: string | null;
  hours: OpeningHours[];
};

/** Contact details and opening hours, as Yllka set them in the admin. */
export const getBusinessInfo = cache(async (): Promise<BusinessInfo> => {
  try {
    const { maps_url, ...business } = await publicFetch<ApiBusiness>(
      "/api/business",
      contentTags.business,
    );
    return { ...business, mapsUrl: maps_url };
  } catch (error) {
    // The header and footer need this on every page: keep the site up with
    // the name alone rather than failing every page when the API is down.
    console.error("API unavailable for /api/business; showing the name only.", String(error));
    return {
      name: "Yllka",
      phone: null,
      email: null,
      instagram: null,
      facebook: null,
      address: null,
      mapsUrl: null,
      hours: [],
    };
  }
});
