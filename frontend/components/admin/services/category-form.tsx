"use client";

import { useActionState, useState } from "react";

import { deleteCategory, saveCategory } from "@/app/admin/(panel)/services/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { EnglishFields, SwitchField, TextAreaField, TextField } from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { PhotoUploader, type Tile } from "@/components/admin/photo-uploader";
import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";
import type { AdminCategory } from "@/types/admin-content";

const text = adminText.services.categoryForm;

export function CategoryForm({ category }: { category: AdminCategory | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveCategory.bind(null, category?.id ?? null),
    { status: "idle" },
  );
  const [tiles, setTiles] = useState<Tile[]>([]);
  const uploading = tiles.some((tile) => tile.status === "uploading");
  const errorFor = (field: string) =>
    state.status === "error" && state.field === field ? state.message : undefined;

  return (
    <>
      <form action={formAction} className="space-y-6">
        <TextField
          label={text.name}
          name="name_sq"
          defaultValue={category?.name_sq}
          placeholder={text.namePlaceholder}
          required
          maxLength={80}
          autoComplete="off"
          error={errorFor("name_sq")}
        />

        <TextAreaField
          label={text.description}
          name="description_sq"
          defaultValue={category?.description_sq ?? ""}
          hint={text.descriptionHint}
          maxLength={300}
          optional
          error={errorFor("description_sq")}
        />

        <div>
          <p className="text-label text-stone uppercase">
            {text.photo}
            <span className="ml-2 tracking-normal normal-case">({adminText.common.optional})</span>
          </p>
          <p className="mt-1 mb-3 text-small text-stone">{text.photoHint}</p>
          <PhotoUploader
            name="image"
            initial={category?.image ? [category.image] : []}
            onChange={setTiles}
            error={errorFor("image_id")}
          />
        </div>

        <EnglishFields defaultOpen={Boolean(category?.name_en || category?.description_en)}>
          <TextField
            label={text.name}
            name="name_en"
            defaultValue={category?.name_en ?? ""}
            maxLength={80}
            autoComplete="off"
            lang="en"
          />
          <TextAreaField
            label={text.description}
            name="description_en"
            defaultValue={category?.description_en ?? ""}
            maxLength={300}
            lang="en"
          />
        </EnglishFields>

        <SwitchField
          name="is_active"
          label={adminText.common.visible}
          hint={text.visibleHint}
          defaultChecked={category?.is_active ?? true}
        />

        <FormFooter
          state={uploading ? { status: "error", message: adminText.upload.waitForUploads } : state}
          pending={pending}
          disabled={uploading}
          label={category ? text.save : text.create}
        />
      </form>

      {category && (
        <div className="mt-12">
          <ConfirmDelete
            label={text.delete}
            question={text.deleteConfirm}
            action={() => deleteCategory(category.id)}
          />
        </div>
      )}
    </>
  );
}
