import type { Locale } from "@/i18n/config";
import { placeholderImages, type PlaceholderImage } from "@/lib/placeholder-images";
import type { PortfolioItem } from "@/types/portfolio";

/*
 * DEMO DATA for development only. These are stock photos, not Yllka's work,
 * and must never be published as her portfolio. Delete this file once the
 * portfolio API exists and real work has been uploaded.
 */

type DemoItem = {
  slug: string;
  title: Record<Locale, string>;
  category: { slug: string; name: Record<Locale, string> };
  image: PlaceholderImage;
  focalPoint?: string;
};

const bridal = { slug: "bridal", name: { en: "Bridal", sq: "Nuse" } };
const makeup = { slug: "makeup", name: { en: "Makeup", sq: "Make-up" } };
const hair = { slug: "hair", name: { en: "Hair", sq: "Flokë" } };

const featuredItems: DemoItem[] = [
  {
    slug: "bridal-hair-vine",
    title: { en: "Bridal updo with a hair vine", sq: "Flokë nuseje me aksesor kristali" },
    category: bridal,
    image: placeholderImages.workBridalVine,
    focalPoint: "50% 30%",
  },
  {
    slug: "bronze-glam",
    title: { en: "Warm bronze glam", sq: "Glam në tone bronzi" },
    category: makeup,
    image: placeholderImages.workBronzeGlam,
  },
  {
    slug: "floral-chignon",
    title: { en: "Low chignon with a floral pin", sq: "Topuz i ulët me aksesor me lule" },
    category: hair,
    image: placeholderImages.workFloralChignon,
    focalPoint: "50% 35%",
  },
  {
    slug: "classic-red-lip",
    title: { en: "Classic red lip", sq: "Buzë të kuqe klasike" },
    category: makeup,
    image: placeholderImages.workRedLip,
    focalPoint: "50% 40%",
  },
];

export function getDemoFeaturedWork(locale: Locale): PortfolioItem[] {
  return featuredItems.map((item) => ({
    id: `demo-${item.slug}`,
    slug: item.slug,
    title: item.title[locale],
    category: { slug: item.category.slug, name: item.category.name[locale] },
    cover: {
      src: item.image.src,
      alt: item.image.alt[locale],
      focalPoint: item.focalPoint,
    },
  }));
}
