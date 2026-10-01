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
  workBridalChignon: {
    src: "https://images.unsplash.com/photo-1742569181882-f5f05293e00f",
    width: 4160,
    height: 6240,
    alt: {
      en: "A bride's hair in a soft, textured chignon, seen from behind",
      sq: "Flokët e një nuseje në një topuz të butë, parë nga pas",
    },
    credit: "Alexander Mass",
    source: "https://unsplash.com/photos/a-brides-hair-styled-in-an-elegant-updo-uXG_pkbauk8",
  },
  workRedLip: {
    src: "https://images.unsplash.com/photo-1618835962148-cf177563c6c0",
    width: 3304,
    height: 4129,
    alt: {
      en: "Portrait with defined lashes and a classic red lip",
      sq: "Portret me qerpikë të theksuar dhe buzë të kuqe klasike",
    },
    credit: "Ehsan Ahmadi",
    source: "https://unsplash.com/photos/woman-with-red-lipstick-and-black-mascara-vsWy6nchcOs",
  },
  workAuburnTwist: {
    src: "https://images.unsplash.com/photo-1614020863825-28a0bb7e3c3c",
    width: 3376,
    height: 6000,
    alt: {
      en: "Auburn waves pulled back from the sides into a twisted knot",
      sq: "Valë flokësh bakri të mbledhura anash në një nyjë të përdredhur",
    },
    credit: "jagadshd",
    source: "https://unsplash.com/photos/auburn-hair-in-central-knot-1JEr_PNa5EY",
  },
  workPearlAccessory: {
    src: "https://images.unsplash.com/photo-1782776852521-77b0aed8831d",
    width: 3640,
    height: 3244,
    alt: {
      en: "A low updo finished with a pearl and crystal hair piece",
      sq: "Flokë të mbledhura poshtë, të plotësuara me një aksesor me perla dhe kristale",
    },
    credit: "nicola dowie",
    source: "https://unsplash.com/photos/a-woman-wearing-a-beautiful-pearl-and-crystal-hair-accessory-haKuqdYtlvE",
  },
  workNaturalSkin: {
    src: "https://images.unsplash.com/photo-1674932668403-33398b81c92f",
    width: 5504,
    height: 8256,
    alt: {
      en: "Close-up of fresh, natural makeup with softly defined brows",
      sq: "Make-up i freskët e natyral nga afër, me vetulla të theksuara lehtë",
    },
    credit: "Yoad Shejtman",
    source: "https://unsplash.com/photos/a-close-up-of-a-woman-with-a-ponytail-YhMFYJZgMA0",
  },
  approachEyeliner: {
    src: "https://images.unsplash.com/photo-1638959882708-9503b1cd595f",
    width: 4000,
    height: 2856,
    alt: {
      en: "Eyeliner being applied with a fine brush, in black and white",
      sq: "Aplikimi i eyeliner-it me një furçë të hollë, bardh e zi",
    },
    credit: "Aritra Roy",
    source: "https://unsplash.com/photos/a-woman-is-putting-makeup-on-her-face-xwaQ6FFqmLQ",
  },
  workBridalVine: {
    src: "https://images.unsplash.com/photo-1629326017926-9cad9c909196",
    width: 3648,
    height: 5472,
    alt: {
      en: "A bride's low updo with a crystal hair vine, under a sheer veil",
      sq: "Flokë nuseje të mbledhura me aksesor kristali, nën një vello të tejdukshme",
    },
    credit: "Ruvim Fomin",
    source: "https://unsplash.com/photos/woman-in-white-wedding-dress-nKsev-cGRuA",
  },
  workBronzeGlam: {
    src: "https://images.unsplash.com/photo-1742341946710-90a31be67a41",
    width: 2160,
    height: 2700,
    alt: {
      en: "Portrait with warm bronze eye makeup and glossy lips",
      sq: "Portret me make-up në tone bronzi dhe buzë me shkëlqim",
    },
    credit: "amirreza zareiyan",
    source: "https://unsplash.com/photos/a-woman-poses-beautifully-with-bold-makeup-xJs3_ixt8Cs",
  },
  workFloralChignon: {
    src: "https://images.unsplash.com/photo-1610653093036-884c3f867fe3",
    width: 4480,
    height: 6720,
    alt: {
      en: "A low chignon finished with a white floral hairpiece",
      sq: "Topuz i ulët i përfunduar me një aksesor me lule të bardha",
    },
    credit: "Brock Wegner",
    source: "https://unsplash.com/photos/woman-with-white-flower-on-her-hair-MXWmzSnmIMo",
  },
  workGlossyWaves: {
    src: "https://images.unsplash.com/photo-1564141696939-9eb6e957ccfc",
    width: 3000,
    height: 1850,
    alt: {
      en: "Long, glossy dark hair styled in soft waves",
      sq: "Flokë të gjata e të errëta me shkëlqim, të stilizuara me valë të buta",
    },
    credit: "Ali Pazani",
    source: "https://unsplash.com/photos/topless-woman-with-eyes-closed-3w14X-Yxffk",
  },
  workCopperBraid: {
    src: "https://images.unsplash.com/photo-1573516193421-e587039fb189",
    width: 3648,
    height: 5472,
    alt: {
      en: "Copper hair in a half-up braid with a small flower",
      sq: "Flokë ngjyrë bakri me gërshet gjysmë të mbledhur dhe një lule të vogël",
    },
    credit: "lucas mendes",
    source: "https://unsplash.com/photos/womens-red-hair-p5MaMz7rxYU",
  },
  workBridalTiara: {
    src: "https://images.unsplash.com/photo-1599029575302-290d8f461dc9",
    width: 3648,
    height: 5472,
    alt: {
      en: "A smiling bride with soft makeup, a tiara and a veil",
      sq: "Një nuse e buzëqeshur me make-up të butë, diademë dhe vello",
    },
    credit: "Jonathan Borba",
    source: "https://unsplash.com/photos/woman-in-white-floral-lace-dress-oGQOxDRpZfg",
  },
  workSoftMinimal: {
    src: "https://images.unsplash.com/photo-1643932919088-53349a7c3385",
    width: 8272,
    height: 10538,
    alt: {
      en: "Soft, minimal makeup with a sleek low bun",
      sq: "Make-up i lehtë dhe minimal me topuz të ulët e të lëmuar",
    },
    credit: "see plus",
    source: "https://unsplash.com/photos/a-woman-with-a-ponytail-is-posing-for-a-picture-k8AWNNCry-0",
  },
} satisfies Record<string, PlaceholderImage>;
