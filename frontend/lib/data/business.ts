import "server-only";

import { cache } from "react";

import { contentTags } from "@/lib/content-tags";
import { publicFetchOr } from "@/lib/data/public-api";
import type { BusinessInfo, OpeningHours } from "@/types/business";

type ApiBusiness = Omit<BusinessInfo, "mapsUrl" | "hours"> & {
  maps_url: string | null;
  hours: OpeningHours[];
};

/** Contact details and opening hours, as Yllka set them in the admin. */
export const getBusinessInfo = cache(async (): Promise<BusinessInfo> => {
  // The header and footer need this on every page: a build without the API
  // shows the name alone rather than failing every page.
  const { maps_url, ...business } = await publicFetchOr<ApiBusiness>(
    "/api/business",
    contentTags.business,
    {
      name: "Yllka",
      phone: null,
      email: null,
      instagram: null,
      facebook: null,
      address: null,
      maps_url: null,
      hours: [],
    },
  );
  return { ...business, mapsUrl: maps_url };
});
