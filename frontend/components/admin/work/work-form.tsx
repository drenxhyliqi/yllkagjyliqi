"use client";

import { useActionState, useState } from "react";

import { deleteWork, saveWork } from "@/app/admin/(panel)/work/actions";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import {
  EnglishFields,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
  type Option,
} from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { PhotoUploader, type Tile } from "@/components/admin/photo-uploader";
import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";
import type { AdminWork } from "@/types/admin-content";

const text = adminText.work.form;

type WorkFormProps = {
  item: AdminWork | null;
  categories: Option[];
};

export function WorkForm({ item, categories }: WorkFormProps) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveWork.bind(null, item?.id ?? null),
    { status: "idle" },
  );
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [published, setPublished] = useState(item?.is_published ?? true);
  const uploading = tiles.some((tile) => tile.status === "uploading");
  const errorFor = (field: string) =>
    state.status === "error" && state.field === field ? state.message : undefined;

  const submitLabel = item ? text.save : published ? text.create : text.createHidden;

  return (
    <>
      <form action={formAction} className="space-y-6">
        <div>
          <p className="mb-3 text-label text-stone uppercase">{text.photos}</p>
          <PhotoUploader
            name="images"
            multiple
            initial={item?.images ?? []}
            onChange={setTiles}
            error={errorFor("image_ids")}
          />
        </div>

        <TextField
          label={text.title}
          name="title_sq"
          defaultValue={item?.title_sq}
          placeholder={text.titlePlaceholder}
          required
          maxLength={120}
          autoComplete="off"
          error={errorFor("title_sq")}
        />

        <SelectField
          label={text.category}
          name="category_id"
          defaultValue={item ? (item.category_id ?? "") : (categories[0]?.value ?? "")}
          options={[...categories, { value: "", label: text.noCategory }]}
          error={errorFor("category_id")}
        />

        <TextAreaField
          label={text.description}
          name="description_sq"
          defaultValue={item?.description_sq ?? ""}
          hint={text.descriptionHint}
          maxLength={1000}
          optional
          error={errorFor("description_sq")}
        />

        <EnglishFields defaultOpen={Boolean(item?.title_en || item?.description_en)}>
          <TextField
            label={text.title}
            name="title_en"
            defaultValue={item?.title_en ?? ""}
            maxLength={120}
            autoComplete="off"
            lang="en"
          />
          <TextAreaField
            label={text.description}
            name="description_en"
            defaultValue={item?.description_en ?? ""}
            maxLength={1000}
            lang="en"
          />
        </EnglishFields>

        <div>
          <SwitchField
            name="is_published"
            label={text.published}
            hint={text.publishedHint}
            defaultChecked={item?.is_published ?? true}
            onChange={setPublished}
          />
          <SwitchField
            name="is_featured"
            label={text.featured}
            hint={text.featuredHint}
            defaultChecked={item?.is_featured ?? false}
          />
        </div>

        <FormFooter
          state={uploading ? { status: "error", message: adminText.upload.waitForUploads } : state}
          pending={pending}
          disabled={uploading}
          label={submitLabel}
        />
      </form>

      {item && (
        <div className="mt-12">
          <ConfirmDelete
            label={text.delete}
            question={text.deleteConfirm}
            action={() => deleteWork(item.id)}
          />
        </div>
      )}
    </>
  );
}
