import type { Dictionary } from "@/i18n/dictionaries/en";

export type BookingErrorKey = keyof Dictionary["bookingPage"]["errors"];
export type DetailsField = "name" | "phone" | "email" | "address";

export type ContactDetails = {
  name: string;
  phone: string;
  email: string;
  note: string;
  /** Only for appointments at the client's place. */
  address: string;
};

export const ADDRESS_MAX_LENGTH = 300;

export const NOTE_MAX_LENGTH = 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Digits with optional +, spaces, dashes, dots or brackets; 6–15 digits. */
const PHONE = /^\+?[\d\s().-]+$/;

/**
 * Checks the contact step. Used by the wizard for instant feedback and by the
 * server action, which must never trust the browser's checks alone.
 */
export function validateDetails(
  details: ContactDetails,
  needsAddress = false,
): Partial<Record<DetailsField, BookingErrorKey>> {
  const errors: Partial<Record<DetailsField, BookingErrorKey>> = {};
  const name = details.name.trim();
  const phone = details.phone.trim();
  const digits = phone.replace(/\D/g, "");

  if (name.length < 2 || name.length > 120) errors.name = "name";
  if (!PHONE.test(phone) || digits.length < 6 || digits.length > 15)
    errors.phone = "phone";
  if (details.email.trim().length > 254 || !EMAIL.test(details.email.trim()))
    errors.email = "email";
  const address = details.address.trim();
  if (needsAddress && (address.length < 5 || address.length > ADDRESS_MAX_LENGTH))
    errors.address = "address";
  return errors;
}
