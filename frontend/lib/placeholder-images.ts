import type { Locale } from "@/i18n/config";

/*
 * TEMPORARY stock photography, used until Yllka's own photos are available.
 * Every placeholder image on the site comes from this file, so replacing them
 * later means changing only this file (and eventually loading from the API).
 *
 * Source: Unsplash, free to use under the Unsplash License. Not Yllka's work,
 * so none of these may be presented as her portfolio in production.
 */

export type PlaceholderImage = {
  src: string;
  width: number;
  height: number;
  alt: Record<Locale, string>;
  credit: string;
  source: string;
};

export const placeholderImages = {
  heroMakeup: {
    src: "https://images.unsplash.com/photo-1709477542170-f11ee7d471a0",
    width: 4000,
    height: 6000,
    alt: {
      en: "A makeup artist applies eyeshadow with a fine brush",
      sq: "Një artiste make-up aplikon hije sysh me një furçë të hollë",
    },
    credit: "Lola Azizada",
    source: "https://unsplash.com/photos/a-woman-is-putting-makeup-on-her-face-Bv8pYo9RJno",
  },
  categoryHair: {
    src: "https://images.unsplash.com/photo-1672788725446-c303ec2b318e",
    width: 5472,
    height: 3648,
    alt: {
      en: "A stylist finishes a sleek low chignon with a jewelled hair accessory",
      sq: "Një stiliste përfundon një topuz të ulët e të lëmuar me një aksesor me gurë",
    },
    credit: "Enis Yavuz",
    source: "https://unsplash.com/photos/a-woman-getting-her-hair-done-by-a-hair-stylist-EEo_VkcATgw",
  },
  categoryMakeup: {
    src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2",
    width: 4088,
    height: 2725,
    alt: {
      en: "Close-up of evening makeup with winged eyeliner and pink lips",
      sq: "Make-up mbrëmjeje nga afër, me eyeliner dhe buzë rozë",
    },
    credit: "freestocks",
    source: "https://unsplash.com/photos/woman-getting-lips-applied-with-lipstick-YGmk9UZMdZg",
  },
  categoryBridal: {
    src: "https://images.unsplash.com/photo-1643216583837-f6d664d48eac",
    width: 3948,
    height: 5922,
    alt: {
      en: "A bride with a soft updo and a long veil smiles by a window",
      sq: "Një nuse me flokë të mbledhura dhe vello të gjatë buzëqesh pranë dritares",
    },
    credit: "Andres Molina",
    source: "https://unsplash.com/photos/a-woman-in-a-wedding-dress-looking-out-a-window-WKXKCghIwUk",
  },
  categoryOther: {
    src: "https://images.unsplash.com/photo-1701271482230-5ecaec3cd3e1",
    width: 12992,
    height: 12992,
    alt: {
      en: "Loose powder and a makeup brush on a neutral background",
      sq: "Pudër dhe furçë make-up mbi një sfond neutral",
    },
    credit: "Superkitina",
    source: "https://unsplash.com/photos/a-white-table-topped-with-two-different-types-of-makeup-8JsIE0k0aLU",
  },
} satisfies Record<string, PlaceholderImage>;
