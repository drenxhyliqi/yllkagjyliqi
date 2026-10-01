/**
 * Cache tags for website content. Public pages cache what they read under
 * these; admin saves expire them so the site shows the change right away.
 */
export const contentTags = {
  catalog: "catalog",
  portfolio: "portfolio",
  business: "business",
} as const;
