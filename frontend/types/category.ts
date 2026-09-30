import type { ImageAsset } from "@/types/image";

/** A service category as the public site receives it: active only, in display order. */
export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: ImageAsset | null;
};
