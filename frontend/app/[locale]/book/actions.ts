"use server";

import { headers } from "next/headers";

import { isLocale } from "@/i18n/config";
import { ApiError, apiFetch } from "@/lib/api";
import { MAX_PEOPLE, MAX_SERVICES } from "@/lib/booking/selection";
import {
  ADDRESS_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  validateDetails,
  type BookingErrorKey,
  type DetailsField,
} from "@/lib/booking/validation";
import { getServiceCatalog } from "@/lib/data/services";

export type BookingResult =
  | { status: "idle" }
  | {
      status: "error";
      /** Problems with a specific step the visitor can go back to. */
      fields: Partial<
        Record<DetailsField | "service" | "slot" | "consent" | "form", BookingErrorKey>
      >;
    }
  | { status: "received"; name: string; reference: string; manageToken: string };

const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "");

/** The chosen services, as sent by the wizard: [{ slug, quantity }]. */
function parseItems(raw: string): { slug: string; quantity: number }[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items = parsed
      .filter(
        (entry): entry is { slug: string; quantity: number } =>
          typeof entry?.slug === "string" && Number.isInteger(entry?.quantity),
      )
      .map(({ slug, quantity }) => ({ slug, quantity: Math.min(Math.max(quantity, 1), MAX_PEOPLE) }));
    const unique = new Set(items.map((item) => item.slug));
    return unique.size === items.length ? items.slice(0, MAX_SERVICES) : [];
  } catch {
    return [];
  }
}

export async function requestAppointment(
  _previous: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const locale = text(formData, "locale");
  if (!isLocale(locale))
    return { status: "error", fields: { form: "generic" } };

  const location = text(formData, "location") === "client" ? "client" : "studio";
  const details = {
    name: text(formData, "name"),
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    note: text(formData, "note").slice(0, NOTE_MAX_LENGTH),
    address: text(formData, "address").slice(0, ADDRESS_MAX_LENGTH),
  };
  const fields: Extract<BookingResult, { status: "error" }>["fields"] = {
    ...validateDetails(details, location === "client"),
  };

  const services = (await getServiceCatalog(locale)).flatMap((category) => category.services);
  const items = parseItems(text(formData, "items")).flatMap(({ slug, quantity }) => {
    const service = services.find((candidate) => candidate.slug === slug);
    return service && service.durationMinutes !== null ? [{ service_id: service.id, quantity }] : [];
  });
  if (items.length === 0) fields.service = "service";

  const date = text(formData, "date");
  const time = text(formData, "time");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) fields.slot = "slot";
  if (formData.get("consent") !== "on") fields.consent = "consent";

  if (Object.keys(fields).length > 0) return { status: "error", fields };

  // The API makes the final, transaction-safe check that the time is free.
  const requestHeaders = await headers();
  const clientIp =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  try {
    const receipt = await apiFetch<{ reference: string; manage_token: string }>("/api/bookings", {
      method: "POST",
      headers: { "X-Client-IP": clientIp },
      json: {
        items,
        location,
        address: location === "client" ? details.address.trim() : null,
        date,
        time,
        customer_name: details.name.trim(),
        customer_phone: details.phone.trim(),
        customer_email: details.email.trim() || null,
        customer_note: details.note.trim() || null,
        locale,
      },
    });
    return {
      status: "received",
      name: details.name.trim(),
      reference: receipt.reference,
      manageToken: receipt.manage_token,
    };
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status === 409) return { status: "error", fields: { slot: "slotTaken" } };
    if (status === 429) {
      const pendingLimit = error instanceof ApiError && error.code === "pending_limit";
      return { status: "error", fields: { form: pendingLimit ? "pendingLimit" : "tooMany" } };
    }
    return { status: "error", fields: { form: "generic" } };
  }
}
