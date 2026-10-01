"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { adminText } from "@/i18n/admin";
import { checked, mutate, saved, text, type FormState } from "@/lib/admin/mutate";
import { contentTags } from "@/lib/content-tags";
import type { PriceType } from "@/types/service";

const LIST = "/admin/services";

function refresh() {
  revalidatePath(LIST, "layout");
  updateTag(contentTags.catalog);
  // Category names also label portfolio work.
  updateTag(contentTags.portfolio);
}

// ——— Categories ———

export async function saveCategory(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await mutate(id ? `/api/admin/categories/${id}` : "/api/admin/categories", {
    method: id ? "PUT" : "POST",
    json: {
      name_sq: text(formData, "name_sq"),
      name_en: text(formData, "name_en"),
      description_sq: text(formData, "description_sq"),
      description_en: text(formData, "description_en"),
      image_id: text(formData, "image"),
      is_active: checked(formData, "is_active"),
    },
  });
  if (!result.ok) return result.state;
  refresh();
  redirect(`${LIST}?saved=category`);
}

export async function deleteCategory(id: string): Promise<FormState> {
  const result = await mutate(
    `/api/admin/categories/${id}`,
    { method: "DELETE" },
    { 409: adminText.services.categoryForm.inUse, 404: adminText.common.notFound },
  );
  if (!result.ok) return result.state;
  refresh();
  redirect(`${LIST}?saved=deleted`);
}

export async function reorderCategories(ids: string[]): Promise<FormState> {
  const result = await mutate("/api/admin/categories-order", { method: "PUT", json: { ids } });
  if (!result.ok) return { ...result.state, message: adminText.common.reorderFailed };
  refresh();
  return saved();
}

// ——— Services ———

/** "25", "12,50" or "12.50" → 12.5; anything else → NaN. */
function parsePrice(value: string | null): number {
  if (!value) return Number.NaN;
  const normalized = value.replace(/\s|€/g, "").replace(",", ".");
  return /^\d{1,6}(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : Number.NaN;
}

export async function saveService(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const priceType = (text(formData, "price_type") ?? "fixed") as PriceType;
  const price = priceType === "on_request" ? null : parsePrice(text(formData, "price"));
  if (price !== null && Number.isNaN(price)) {
    return {
      status: "error",
      field: "price",
      message: adminText.services.form.priceInvalid,
    };
  }
  const duration = text(formData, "duration_minutes");

  const result = await mutate(id ? `/api/admin/services/${id}` : "/api/admin/services", {
    method: id ? "PUT" : "POST",
    json: {
      category_id: text(formData, "category_id"),
      name_sq: text(formData, "name_sq"),
      name_en: text(formData, "name_en"),
      description_sq: text(formData, "description_sq"),
      description_en: text(formData, "description_en"),
      price,
      price_type: priceType,
      duration_minutes: duration ? Number(duration) : null,
      is_active: checked(formData, "is_active"),
    },
  });
  if (!result.ok) return result.state;
  refresh();
  redirect(`${LIST}?saved=service`);
}

export async function deleteService(id: string): Promise<FormState> {
  const result = await mutate(
    `/api/admin/services/${id}`,
    { method: "DELETE" },
    { 404: adminText.common.notFound },
  );
  if (!result.ok) return result.state;
  refresh();
  redirect(`${LIST}?saved=deleted`);
}

export async function reorderServices(categoryId: string, ids: string[]): Promise<FormState> {
  const result = await mutate(`/api/admin/categories/${categoryId}/services-order`, {
    method: "PUT",
    json: { ids },
  });
  if (!result.ok) return { ...result.state, message: adminText.common.reorderFailed };
  refresh();
  return saved();
}
