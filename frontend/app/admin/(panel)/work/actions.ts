"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { adminText } from "@/i18n/admin";
import { checked, mutate, saved, text, type FormState } from "@/lib/admin/mutate";
import { contentTags } from "@/lib/content-tags";

const LIST = "/admin/work";

function refresh() {
  revalidatePath(LIST, "layout");
  updateTag(contentTags.portfolio);
}

export async function saveWork(
  id: string | null,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const imageIds = formData.getAll("images").map(String).filter(Boolean);
  if (imageIds.length === 0) {
    return { status: "error", field: "image_ids", message: adminText.upload.needOne };
  }
  const result = await mutate(
    id ? `/api/admin/portfolio/${id}` : "/api/admin/portfolio",
    {
      method: id ? "PUT" : "POST",
      json: {
        title_sq: text(formData, "title_sq"),
        title_en: text(formData, "title_en"),
        description_sq: text(formData, "description_sq"),
        description_en: text(formData, "description_en"),
        category_id: text(formData, "category_id"),
        image_ids: imageIds,
        is_featured: checked(formData, "is_featured"),
        is_published: checked(formData, "is_published"),
      },
    },
    { 404: adminText.common.notFound },
  );
  if (!result.ok) return result.state;
  refresh();
  redirect(`${LIST}?saved=work`);
}

export async function deleteWork(id: string): Promise<FormState> {
  const result = await mutate(
    `/api/admin/portfolio/${id}`,
    { method: "DELETE" },
    { 404: adminText.common.notFound },
  );
  if (!result.ok) return result.state;
  refresh();
  redirect(`${LIST}?saved=deleted`);
}

export async function reorderWork(ids: string[]): Promise<FormState> {
  const result = await mutate("/api/admin/portfolio-order", { method: "PUT", json: { ids } });
  if (!result.ok) return { ...result.state, message: adminText.common.reorderFailed };
  refresh();
  return saved();
}
