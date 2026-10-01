import type { Locale } from "@/i18n/config";
import { getDemoCategories } from "@/lib/demo/categories";
import type { CategoryWithServices, PriceType, Service } from "@/types/service";

/*
 * DEMO DATA for development only. Services, prices and durations are
 * placeholders until Yllka enters her real ones in the admin. Must not reach
 * production: delete this file once the services API exists.
 */

type DemoService = {
  slug: string;
  name: Record<Locale, string>;
  description?: Record<Locale, string>;
  price: number | null;
  priceType: PriceType;
  durationMinutes: number | null;
};

const demoServices: Record<string, DemoService[]> = {
  hair: [
    {
      slug: "blow-dry",
      name: { en: "Blow-dry", sq: "Fëno" },
      description: {
        en: "Smooth, voluminous finish for any length.",
        sq: "Përfundim i lëmuar dhe me volum për çdo gjatësi.",
      },
      price: 15,
      priceType: "fixed",
      durationMinutes: 45,
    },
    {
      slug: "waves-and-curls",
      name: { en: "Waves & curls", sq: "Valë dhe kaçurrela" },
      description: {
        en: "Soft waves or defined curls that last through the day.",
        sq: "Valë të buta ose kaçurrela të formuara që zgjasin gjithë ditën.",
      },
      price: 20,
      priceType: "fixed",
      durationMinutes: 60,
    },
    {
      slug: "updo",
      name: { en: "Updo", sq: "Flokë të mbledhura" },
      description: {
        en: "Chignons, buns and half-up styles for events.",
        sq: "Topuze dhe modele gjysmë të mbledhura për evente.",
      },
      price: 25,
      priceType: "from",
      durationMinutes: 75,
    },
    {
      slug: "braids",
      name: { en: "Braids", sq: "Gërsheta" },
      price: 20,
      priceType: "fixed",
      durationMinutes: 60,
    },
  ],
  makeup: [
    {
      slug: "day-makeup",
      name: { en: "Day makeup", sq: "Make-up ditor" },
      description: {
        en: "Fresh, natural skin and soft definition.",
        sq: "Lëkurë e freskët dhe natyrale, me theksim të butë.",
      },
      price: 25,
      priceType: "fixed",
      durationMinutes: 45,
    },
    {
      slug: "evening-makeup",
      name: { en: "Evening makeup", sq: "Make-up mbrëmjeje" },
      description: {
        en: "A more defined look for dinners and parties.",
        sq: "Pamje më e theksuar për darka dhe festa.",
      },
      price: 35,
      priceType: "fixed",
      durationMinutes: 60,
    },
    {
      slug: "event-makeup",
      name: {
        en: "Event makeup with lashes",
        sq: "Make-up për evente me qerpikë",
      },
      price: 40,
      priceType: "fixed",
      durationMinutes: 75,
    },
  ],
  bridal: [
    {
      slug: "bridal-makeup",
      name: { en: "Bridal makeup", sq: "Make-up nuseje" },
      description: {
        en: "Long-wearing makeup designed around your dress and day.",
        sq: "Make-up që zgjat, i krijuar sipas fustanit dhe ditës suaj.",
      },
      price: 80,
      priceType: "from",
      durationMinutes: 90,
    },
    {
      slug: "bridal-hair",
      name: { en: "Bridal hair", sq: "Flokë nuseje" },
      price: 70,
      priceType: "from",
      durationMinutes: 90,
    },
    {
      slug: "bridal-hair-and-makeup",
      name: { en: "Bridal hair & makeup", sq: "Flokë dhe make-up nuseje" },
      price: 140,
      priceType: "from",
      durationMinutes: 180,
    },
    {
      slug: "bridal-trial",
      name: { en: "Trial session", sq: "Seancë prove" },
      description: {
        en: "Try the look before the day and adjust the details together.",
        sq: "Provoni pamjen para ditës dhe rregulloni detajet bashkë.",
      },
      price: 50,
      priceType: "fixed",
      durationMinutes: 120,
    },
  ],
  other: [
    {
      slug: "lash-application",
      name: { en: "Lash application", sq: "Vendosje qerpikësh" },
      price: 10,
      priceType: "fixed",
      durationMinutes: 15,
    },
    {
      slug: "group-bookings",
      name: { en: "Group bookings", sq: "Rezervime për grupe" },
      description: {
        en: "Bridesmaids, families and events. Get in touch for a quote.",
        sq: "Shoqëruese të nuses, familje dhe evente. Na kontaktoni për ofertë.",
      },
      price: null,
      priceType: "on_request",
      durationMinutes: null,
    },
  ],
};

export function getDemoServiceCatalog(locale: Locale): CategoryWithServices[] {
  return getDemoCategories(locale).map((category) => ({
    ...category,
    services: (demoServices[category.slug] ?? []).map((service): Service => ({
      id: `demo-${service.slug}`,
      slug: service.slug,
      name: service.name[locale],
      description: service.description?.[locale] ?? null,
      price: service.price,
      priceType: service.priceType,
      durationMinutes: service.durationMinutes,
    })),
  }));
}
