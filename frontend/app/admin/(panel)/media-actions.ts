"use server";

import { adminText } from "@/i18n/admin";
import { mutate } from "@/lib/admin/mutate";
import type { Media } from "@/types/admin-content";

export type UploadResult = { ok: true; media: Media } | { ok: false; message: string };

/** Uploads one photo. It is kept once saved with a category or a piece of work. */
export async function uploadPhoto(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: adminText.upload.unreadable };
  }
  const upload = new FormData();
  upload.set("file", file, file.name || "photo.jpg");
  const result = await mutate<Media>(
    "/api/admin/media",
    { method: "POST", form: upload },
    { 422: adminText.upload.unreadable, 413: adminText.upload.tooLarge, 503: adminText.upload.storageDown },
  );
  return result.ok
    ? { ok: true, media: result.data }
    : { ok: false, message: result.state.message ?? adminText.upload.failed };
}
