import type { PriceType } from "@/types/service";

/** An uploaded photo. `url` is "/media/…" for uploads or a full URL for demo photos. */
export type Media = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export type AdminService = {
  id: string;
  category_id: string;
  slug: string;
  name_sq: string;
  name_en: string | null;
  description_sq: string | null;
  description_en: string | null;
  price: number | null;
  price_type: PriceType;
  duration_minutes: number | null;
  is_active: boolean;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name_sq: string;
  name_en: string | null;
  description_sq: string | null;
  description_en: string | null;
  image: Media | null;
  is_active: boolean;
  services: AdminService[];
  work_count: number;
};

export type AdminWork = {
  id: string;
  slug: string;
  title_sq: string;
  title_en: string | null;
  description_sq: string | null;
  description_en: string | null;
  category_id: string | null;
  images: Media[];
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
};

export type AdminBusiness = {
  business_name: string;
  phone: string | null;
  email: string | null;
  street: string | null;
  city: string | null;
  maps_url: string | null;
  instagram: string | null;
  facebook_url: string | null;
};
