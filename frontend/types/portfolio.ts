import type { ImageAsset } from "@/types/image";

/** A published portfolio item as the public site receives it. */
export type PortfolioItem = {
  id: string;
  slug: string;
  title: string;
  category: {
    slug: string;
    name: string;
  };
  cover: ImageAsset;
};
