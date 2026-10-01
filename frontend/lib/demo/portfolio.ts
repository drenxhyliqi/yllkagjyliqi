import type { Locale } from "@/i18n/config";
import {
  placeholderImages,
  type PlaceholderImage,
} from "@/lib/placeholder-images";
import type { PortfolioItem } from "@/types/portfolio";

/*
 * DEMO DATA for development only. These are stock photos, not Yllka's work,
 * and must never be published as her portfolio. Delete this file once the
 * portfolio API exists and real work has been uploaded.
 */

type DemoItem = {
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  category: { slug: string; name: Record<Locale, string> };
  image: PlaceholderImage;
  focalPoint?: string;
  /** Shown on the homepage, in this order. */
  featured?: boolean;
};

const bridal = { slug: "bridal", name: { en: "Bridal", sq: "Nuse" } };
const makeup = { slug: "makeup", name: { en: "Makeup", sq: "Make-up" } };
const hair = { slug: "hair", name: { en: "Hair", sq: "Flokë" } };

const items: DemoItem[] = [
  {
    slug: "bridal-hair-vine",
    title: {
      en: "Bridal updo with a hair vine",
      sq: "Flokë nuseje me aksesor kristali",
    },
    description: {
      en: "A low, textured updo finished with a crystal vine, made to sit comfortably under the veil all day.",
      sq: "Flokë të mbledhura ulët, me tekstura, të përfunduara me aksesor kristali, që qëndrojnë rehat nën vello gjithë ditën.",
    },
    category: bridal,
    image: placeholderImages.workBridalVine,
    focalPoint: "50% 30%",
    featured: true,
  },
  {
    slug: "bronze-glam",
    title: { en: "Warm bronze glam", sq: "Glam në tone bronzi" },
    description: {
      en: "Warm bronze tones on the eyes, glowing skin and a glossy lip for an evening event.",
      sq: "Tone të ngrohta bronzi në sy, lëkurë me shkëlqim dhe buzë me shkëlqim për një event mbrëmjeje.",
    },
    category: makeup,
    image: placeholderImages.workBronzeGlam,
    featured: true,
  },
  {
    slug: "floral-chignon",
    title: {
      en: "Low chignon with a floral pin",
      sq: "Topuz i ulët me aksesor me lule",
    },
    description: {
      en: "A soft, low chignon with loose face-framing strands and a white floral pin.",
      sq: "Topuz i butë e i ulët, me fije të lira rreth fytyrës dhe një aksesor me lule të bardha.",
    },
    category: hair,
    image: placeholderImages.workFloralChignon,
    focalPoint: "50% 35%",
    featured: true,
  },
  {
    slug: "classic-red-lip",
    title: { en: "Classic red lip", sq: "Buzë të kuqe klasike" },
    description: {
      en: "Defined lashes, even skin and a classic red lip that stays put.",
      sq: "Qerpikë të theksuar, lëkurë e njëtrajtshme dhe buzë të kuqe klasike që qëndrojnë.",
    },
    category: makeup,
    image: placeholderImages.workRedLip,
    focalPoint: "50% 40%",
    featured: true,
  },
  {
    slug: "glossy-waves",
    title: { en: "Glossy, soft waves", sq: "Valë të buta me shkëlqim" },
    description: {
      en: "Long hair set in loose, glossy waves with plenty of movement.",
      sq: "Flokë të gjata me valë të lira e me shkëlqim, plot lëvizje.",
    },
    category: hair,
    image: placeholderImages.workGlossyWaves,
  },
  {
    slug: "veil-and-tiara",
    title: { en: "Veil and tiara", sq: "Vello dhe diademë" },
    description: {
      en: "Soft, luminous bridal makeup with a delicate tiara and a long veil.",
      sq: "Make-up nuseje i butë dhe i ndritshëm, me diademë delikate dhe vello të gjatë.",
    },
    category: bridal,
    image: placeholderImages.workBridalTiara,
    focalPoint: "50% 30%",
  },
  {
    slug: "natural-skin",
    title: { en: "Fresh, natural skin", sq: "Lëkurë e freskët, natyrale" },
    description: {
      en: "Light coverage, softly defined brows and a fresh finish.",
      sq: "Mbulim i lehtë, vetulla të theksuara butë dhe përfundim i freskët.",
    },
    category: makeup,
    image: placeholderImages.workNaturalSkin,
  },
  {
    slug: "textured-chignon",
    title: { en: "Soft textured chignon", sq: "Topuz i butë me tekstura" },
    description: {
      en: "A loose, romantic chignon for the wedding day, seen from behind.",
      sq: "Topuz i lirë dhe romantik për ditën e dasmës, i parë nga prapa.",
    },
    category: bridal,
    image: placeholderImages.workBridalChignon,
  },
  {
    slug: "copper-braid",
    title: { en: "Copper half-up braid", sq: "Gërshet në flokë ngjyrë bakri" },
    description: {
      en: "A half-up braid that keeps the length free, finished with a small flower.",
      sq: "Gërshet gjysmë i mbledhur që i lë flokët e lirë, i përfunduar me një lule të vogël.",
    },
    category: hair,
    image: placeholderImages.workCopperBraid,
  },
  {
    slug: "pearl-updo",
    title: { en: "Low updo with pearls", sq: "Flokë të mbledhura me perla" },
    description: {
      en: "A neat, low updo finished with a pearl and crystal hair piece.",
      sq: "Flokë të mbledhura ulët, të rregullta, me një aksesor me perla dhe kristale.",
    },
    category: bridal,
    image: placeholderImages.workPearlAccessory,
  },
  {
    slug: "soft-minimal",
    title: { en: "Soft, minimal makeup", sq: "Make-up i lehtë, minimal" },
    description: {
      en: "Barely-there makeup and a sleek low bun for a clean, modern look.",
      sq: "Make-up pothuajse i padukshëm dhe topuz i ulët e i lëmuar për një pamje të pastër e moderne.",
    },
    category: makeup,
    image: placeholderImages.workSoftMinimal,
    focalPoint: "50% 35%",
  },
  {
    slug: "auburn-twist",
    title: {
      en: "Auburn twisted half-up",
      sq: "Flokë gështenjë me përdredhje",
    },
    description: {
      en: "Auburn waves pulled back from the sides into a soft twisted knot.",
      sq: "Valë ngjyrë gështenjë të mbledhura nga anët në një nyjë të butë me përdredhje.",
    },
    category: hair,
    image: placeholderImages.workAuburnTwist,
  },
];

function toPortfolioItem(item: DemoItem, locale: Locale): PortfolioItem {
  return {
    id: `demo-${item.slug}`,
    slug: item.slug,
    title: item.title[locale],
    description: item.description[locale],
    category: { slug: item.category.slug, name: item.category.name[locale] },
    cover: {
      src: item.image.src,
      alt: item.image.alt[locale],
      focalPoint: item.focalPoint,
      width: item.image.width,
      height: item.image.height,
    },
  };
}

export function getDemoPortfolio(locale: Locale): PortfolioItem[] {
  return items.map((item) => toPortfolioItem(item, locale));
}

export function getDemoFeaturedWork(locale: Locale): PortfolioItem[] {
  return items
    .filter((item) => item.featured)
    .map((item) => toPortfolioItem(item, locale));
}
