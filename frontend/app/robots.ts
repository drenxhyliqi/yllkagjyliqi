import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin, the API and clients' private booking links stay out of search.
      disallow: ["/admin", "/api/", "/sq/booking/", "/en/booking/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
