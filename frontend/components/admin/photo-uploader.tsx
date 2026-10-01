"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { uploadPhoto } from "@/app/admin/(panel)/media-actions";
import { MoveButtons, moved } from "@/components/admin/move-buttons";
import { adminText } from "@/i18n/admin";
import { shrinkPhoto } from "@/lib/admin/shrink-photo";
import { cn } from "@/lib/utils";
import type { Media } from "@/types/admin-content";

const text = adminText.upload;

export type Tile =
  | { key: string; status: "done"; media: Media }
  | { key: string; status: "uploading"; preview: string }
  | { key: string; status: "error"; preview: string; message: string };

type PhotoUploaderProps = {
  initial: Media[];
  /** One photo (a category) or many (portfolio work). */
  multiple?: boolean;
  /** Ids of the finished photos, in order, sent with the form. */
  name: string;
  /** Lets the form know when uploads are still running. */
  onChange?: (tiles: Tile[]) => void;
  error?: string;
};

let counter = 0;
const nextKey = () => `tile-${++counter}`;

export function PhotoUploader({ initial, multiple = false, name, onChange, error }: PhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tiles, setTiles] = useState<Tile[]>(() =>
    initial.map((media) => ({ key: media.id, status: "done", media })),
  );

  useEffect(() => onChange?.(tiles), [tiles, onChange]);

  // Free the in-memory previews when the form goes away.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const update = (key: string, tile: Tile) =>
    setTiles((current) => current.map((t) => (t.key === key ? tile : t)));

  const upload = async (key: string, file: File, preview: string) => {
    const form = new FormData();
    form.set("file", await shrinkPhoto(file));
    const result = await uploadPhoto(form).catch(() => null);
    if (result?.ok) update(key, { key, status: "done", media: result.media });
    else update(key, { key, status: "error", preview, message: result?.message ?? text.failed });
  };

  const add = (files: FileList | null) => {
    if (!files?.length) return;
    const chosen = multiple ? [...files] : [files[0]];
    const added = chosen.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { file, tile: { key: nextKey(), status: "uploading", preview } as const };
    });
    setTiles((current) => (multiple ? [...current, ...added.map((a) => a.tile)] : added.map((a) => a.tile)));
    // One at a time keeps each request small on a phone connection.
    void added.reduce(
      (previous, { file, tile }) => previous.then(() => upload(tile.key, file, tile.preview)),
      Promise.resolve(),
    );
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (key: string) => setTiles((current) => current.filter((t) => t.key !== key));
  const ids = tiles.flatMap((tile) => (tile.status === "done" ? [tile.media.id] : []));
  const showPicker = multiple || tiles.length === 0;

  return (
    <div>
      {ids.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      {tiles.length > 0 && (
        <ul className={cn("grid gap-3", multiple ? "grid-cols-2 sm:grid-cols-3" : "max-w-64")}>
          {tiles.map((tile, index) => {
            const src = tile.status === "done" ? tile.media.url : tile.preview;
            return (
              <li key={tile.key}>
                <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                  {tile.status === "done" ? (
                    <Image src={src} alt="" fill sizes="(min-width: 40rem) 14rem, 45vw" className="object-cover" />
                  ) : (
                    // A local preview of a file that isn't uploaded yet.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
                  )}
                  {tile.status === "uploading" && (
                    <div className="absolute inset-0 grid place-items-center bg-paper/70 text-small">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="size-3 animate-spin rounded-full border border-ink border-t-transparent" />
                        {text.uploading}
                      </span>
                    </div>
                  )}
                  {tile.status === "error" && (
                    <div role="alert" className="absolute inset-0 flex items-end bg-paper/85 p-3 text-small text-error">
                      {tile.message}
                    </div>
                  )}
                  {multiple && index === 0 && tile.status === "done" && (
                    <span className="absolute top-2 left-2 bg-ink px-2 py-1 text-eyebrow tracking-[0.2em] text-paper uppercase">
                      {text.cover}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  {multiple && tiles.length > 1 ? (
                    <MoveButtons
                      name={`${index + 1}`}
                      direction="horizontal"
                      first={index === 0}
                      last={index === tiles.length - 1}
                      onMove={(delta) => setTiles((current) => moved(current, index, delta))}
                    />
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => remove(tile.key)}
                    disabled={tile.status === "uploading"}
                    className="min-h-11 cursor-pointer px-1 text-small text-stone underline-offset-4 hover:text-ink hover:underline disabled:opacity-40"
                  >
                    {text.remove}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showPicker && (
        <div className={tiles.length > 0 ? "mt-5" : undefined}>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(event) => add(event.target.files)}
            className="peer sr-only"
          />
          <label
            htmlFor={inputId}
            className={cn(
              "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-6 py-6 text-center transition-colors hover:border-ink peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink",
              error ? "border-error" : "border-ink/30",
            )}
          >
            <span className="text-label uppercase">{tiles.length > 0 ? text.addMore : text.add}</span>
            {multiple && <span className="text-small text-stone">{text.hint}</span>}
          </label>
        </div>
      )}
      {!multiple && tiles.length > 0 && tiles[0].status !== "uploading" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-1 min-h-11 cursor-pointer text-small underline underline-offset-4"
        >
          {text.replace}
        </button>
      )}
      {!multiple && tiles.length > 0 && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => add(event.target.files)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      {error && (
        <p role="alert" className="mt-2 text-small text-error">
          {error}
        </p>
      )}
    </div>
  );
}
