"use server";

import { revalidatePath, updateTag } from "next/cache";

import { adminText } from "@/i18n/admin";
import { mutate, saved, text, type FormState } from "@/lib/admin/mutate";
import { contentTags } from "@/lib/content-tags";

const fieldMessages: Record<string, string> = {
  phone: adminText.settings.phoneInvalid,
  email: adminText.settings.emailInvalid,
  instagram: adminText.settings.instagramInvalid,
  maps_url: adminText.settings.linkInvalid,
  facebook_url: adminText.settings.linkInvalid,
};

export async function saveBusiness(_previous: FormState, formData: FormData): Promise<FormState> {
  const fields = ["business_name", "phone", "email", "street", "city", "maps_url", "instagram", "facebook_url"];
  const result = await mutate("/api/admin/business", {
    method: "PUT",
    json: Object.fromEntries(fields.map((field) => [field, text(formData, field)])),
  });
  if (!result.ok) {
    const field = result.state.field;
    return field && fieldMessages[field]
      ? { ...result.state, message: fieldMessages[field] }
      : result.state;
  }
  revalidatePath("/admin/settings");
  updateTag(contentTags.business);
  return saved();
}

const account = adminText.account;

export async function changeEmail(_previous: FormState, formData: FormData): Promise<FormState> {
  const result = await mutate(
    "/api/auth/me/email",
    {
      method: "PUT",
      json: { email: text(formData, "email"), current_password: String(formData.get("current_password") ?? "") },
    },
    { 403: account.wrongPassword, 409: account.emailTaken, 422: account.emailInvalid, 429: account.tooMany },
  );
  if (!result.ok) {
    const wrong = result.state.message === account.wrongPassword;
    return { ...result.state, field: wrong ? "current_password" : "email" };
  }
  revalidatePath("/admin", "layout");
  return saved();
}

export async function changePassword(_previous: FormState, formData: FormData): Promise<FormState> {
  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  if (next.length < 10) return { status: "error", field: "new_password", message: account.tooShort };
  if (next !== String(formData.get("repeat_password") ?? "")) {
    return { status: "error", field: "repeat_password", message: account.mismatch };
  }
  if (next === current) return { status: "error", field: "new_password", message: account.same };

  const result = await mutate(
    "/api/auth/me/password",
    { method: "PUT", json: { current_password: current, new_password: next } },
    { 403: account.wrongPassword, 422: account.tooShort, 429: account.tooMany },
  );
  if (!result.ok) {
    const wrong = result.state.message === account.wrongPassword;
    return { ...result.state, field: wrong ? "current_password" : "new_password" };
  }
  return saved();
}
