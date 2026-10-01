"use server";

import { revalidatePath, updateTag } from "next/cache";

import { adminText } from "@/i18n/admin";
import { mutate, saved, text, type FormState } from "@/lib/admin/mutate";
import { contentTags } from "@/lib/content-tags";

function refresh() {
  revalidatePath("/admin/appointments");
  revalidatePath("/admin");
  // Opening hours appear in the website footer and contact page.
  updateTag(contentTags.business);
}

export async function saveHours(_previous: FormState, formData: FormData): Promise<FormState> {
  const days = [1, 2, 3, 4, 5, 6, 7].map((weekday) => {
    const isOpen = formData.get(`open_${weekday}`) === "on";
    return {
      weekday,
      is_open: isOpen,
      opens_at: isOpen ? text(formData, `opens_${weekday}`) : null,
      closes_at: isOpen ? text(formData, `closes_${weekday}`) : null,
      break_starts_at: isOpen ? text(formData, `break_start_${weekday}`) : null,
      break_ends_at: isOpen ? text(formData, `break_end_${weekday}`) : null,
    };
  });
  const result = await mutate(
    "/api/admin/schedule/hours",
    { method: "PUT", json: { days } },
    { 422: adminText.schedule.hours.invalid },
  );
  if (!result.ok) return result.state;
  refresh();
  return saved();
}

export async function saveRules(_previous: FormState, formData: FormData): Promise<FormState> {
  const number = (key: string) => Number(formData.get(key));
  const result = await mutate("/api/admin/schedule/settings", {
    method: "PUT",
    json: {
      slot_interval_minutes: number("slot_interval_minutes"),
      min_notice_minutes: number("min_notice_minutes"),
      booking_window_days: number("booking_window_days"),
      buffer_minutes: number("buffer_minutes"),
      home_visits: formData.get("home_visits") === "on",
      travel_minutes: number("travel_minutes"),
      home_visit_note_sq: text(formData, "home_visit_note_sq"),
      home_visit_note_en: text(formData, "home_visit_note_en"),
      cancellation_notice_hours: number("cancellation_notice_hours"),
      policy_sq: text(formData, "policy_sq"),
      policy_en: text(formData, "policy_en"),
    },
  });
  if (!result.ok) return result.state;
  refresh();
  return saved();
}

export async function addDayOff(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await mutate(
    "/api/admin/schedule/days-off",
    {
      method: "POST",
      json: {
        starts_on: text(formData, "starts_on"),
        ends_on: text(formData, "ends_on"),
        note: text(formData, "note"),
      },
    },
    { 422: adminText.schedule.daysOff.invalid },
  );
  if (!result.ok) return result.state;
  refresh();
  return saved();
}

export async function removeDayOff(id: string): Promise<FormState> {
  const result = await mutate(`/api/admin/schedule/days-off/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!result.ok) return result.state;
  refresh();
  return saved();
}
