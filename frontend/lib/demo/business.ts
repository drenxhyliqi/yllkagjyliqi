import type { BusinessInfo } from "@/types/business";

/*
 * DEMO DATA for development only. Phone, address, Instagram account and
 * opening hours are invented placeholders until Yllka enters her real details
 * in the admin settings. Must not reach production: delete this file once the
 * business settings API exists.
 */
export const demoBusinessInfo: BusinessInfo = {
  name: "Yllka",
  phone: "+383 00 000 000", // deliberately invalid: no real number is ever dialled
  email: "hello@yllka.test",
  // Links to Instagram itself, not to someone else's account.
  instagram: { handle: "yllka.demo", url: "https://www.instagram.com/" },
  facebook: { url: "https://www.facebook.com/" },
  address: { street: "Rruga Shembull 1", city: "Prishtinë" },
  mapsUrl: null,
  hours: [
    { weekday: 1, opens: "09:00", closes: "18:00" },
    { weekday: 2, opens: "09:00", closes: "18:00" },
    { weekday: 3, opens: "09:00", closes: "18:00" },
    { weekday: 4, opens: "09:00", closes: "18:00" },
    { weekday: 5, opens: "09:00", closes: "18:00" },
    { weekday: 6, opens: "09:00", closes: "16:00" },
    { weekday: 7, opens: null, closes: null },
  ],
};
