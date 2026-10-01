"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminText } from "@/i18n/admin";
import { mutate, saved, text, type FormState } from "@/lib/admin/mutate";
import type { Booking, BookingStatus } from "@/types/booking";

const copy = adminText.bookings;

const messages = {
  404: copy.detail.notFound,
  409: copy.detail.overlap,
};

function refresh() {
  // The dashboard, the list, the calendar and the menu badge all show bookings.
  revalidatePath("/admin", "layout");
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus,
  message: string | null,
): Promise<FormState> {
  const result = await mutate(
    `/api/admin/bookings/${id}/status`,
    { method: "POST", json: { status, message: message?.trim() || null } },
    { ...messages, 422: copy.detail.notAllowed },
  );
  if (!result.ok) return result.state;
  refresh();
  return saved();
}

export async function rescheduleBooking(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await mutate(
    `/api/admin/bookings/${id}/reschedule`,
    {
      method: "POST",
      json: {
        date: text(formData, "date"),
        time: text(formData, "time"),
        message: text(formData, "message"),
      },
    },
    messages,
  );
  if (!result.ok) return result.state;
  refresh();
  return saved();
}

export async function saveBookingNote(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await mutate(
    `/api/admin/bookings/${id}/note`,
    { method: "PUT", json: { admin_note: text(formData, "admin_note") } },
    messages,
  );
  if (!result.ok) return result.state;
  refresh();
  return saved();
}

export async function createBooking(_previous: FormState, formData: FormData): Promise<FormState> {
  const duration = text(formData, "duration_minutes");
  const result = await mutate<Booking>(
    "/api/admin/bookings",
    {
      method: "POST",
      json: {
        items: formData.getAll("service_id").map((serviceId, index) => ({
          service_id: String(serviceId),
          quantity: Number(formData.getAll("quantity")[index] ?? 1) || 1,
        })),
        location: text(formData, "location") === "client" ? "client" : "studio",
        address: text(formData, "address"),
        date: text(formData, "date"),
        time: text(formData, "time"),
        duration_minutes: duration ? Number(duration) : null,
        customer_name: text(formData, "customer_name"),
        customer_phone: text(formData, "customer_phone"),
        customer_email: text(formData, "customer_email"),
        customer_note: text(formData, "customer_note"),
        locale: text(formData, "locale") === "en" ? "en" : "sq",
      },
    },
    messages,
  );
  if (!result.ok) {
    const field = result.state.field;
    if (field === "customer_phone") return { ...result.state, message: copy.form.phoneInvalid };
    if (field === "customer_email") return { ...result.state, message: copy.form.emailInvalid };
    return result.state;
  }
  refresh();
  redirect(`/admin/bookings/${result.data.id}?saved=created`);
}

export async function markReminder(id: string, sent: boolean): Promise<FormState> {
  const result = await mutate(`/api/admin/bookings/${id}/reminder`, { method: "PUT", json: { sent } }, messages);
  if (!result.ok) return result.state;
  refresh();
  return saved();
}
