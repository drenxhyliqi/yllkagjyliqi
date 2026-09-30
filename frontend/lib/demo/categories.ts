import type { Locale } from "@/i18n/config";
import { placeholderImages, type PlaceholderImage } from "@/lib/placeholder-images";
import type { Category } from "@/types/category";

/*
 * DEMO DATA for development only. Category names, descriptions and photos
 * are placeholders until Yllka creates her real categories in the admin.
 * Must not reach production: delete this file once the categories API exists.
 */

type DemoCategory = {
  slug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  image: PlaceholderImage;
};

const demoCategories: DemoCategory[] = [
  {
    slug: "hair",
    name: { en: "Hair", sq: "Flokë" },
    description: {
      en: "Styling, blow-dries and updos for any occasion.",
      sq: "Stilim, fëno dhe flokë të mbledhura për çdo rast.",
    },
    image: placeholderImages.categoryHair,
  },
  {
    slug: "makeup",
    name: { en: "Makeup", sq: "Make-up" },
    description: {
      en: "From soft daytime looks to evening glamour.",
      sq: "Nga pamje të lehta ditore deri te make-up mbrëmjeje.",
    },
    image: placeholderImages.categoryMakeup,
  },
  {
    slug: "bridal",
    name: { en: "Bridal", sq: "Nuse" },
    description: {
      en: "Hair and makeup for your wedding day.",
      sq: "Flokë dhe make-up për ditën e dasmës suaj.",
    },
    image: placeholderImages.categoryBridal,
  },
  {
    slug: "other",
    name: { en: "Other", sq: "Të tjera" },
    description: {
      en: "Special requests and services beyond the list.",
      sq: "Kërkesa të veçanta dhe shërbime të tjera.",
    },
    image: placeholderImages.categoryOther,
  },
];

export function getDemoCategories(locale: Locale): Category[] {
  return demoCategories.map((category) => ({
    id: `demo-${category.slug}`,
    slug: category.slug,
    name: category.name[locale],
    description: category.description[locale],
    image: { src: category.image.src, alt: category.image.alt[locale] },
  }));
}
