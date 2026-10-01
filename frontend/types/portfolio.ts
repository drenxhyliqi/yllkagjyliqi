import type { ImageAsset } from "@/types/image";

/** A published portfolio item as the public site receives it. */
export type PortfolioItem = {
  id: string;
  slug: string;
  title: string;
  /** Null when the work isn't in a category. */
  category: {
    slug: string;
    name: string;
  } | null;
  description: string | null;
  featured: boolean;
  /** The first photo. */
  cover: ImageAsset;
  /** Every photo, cover first. */
  images: ImageAsset[];
};
