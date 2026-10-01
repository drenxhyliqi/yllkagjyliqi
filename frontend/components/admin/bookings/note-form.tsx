"use client";

import { useActionState } from "react";

import { saveBookingNote } from "@/app/admin/(panel)/bookings/actions";
import { TextAreaField } from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";

const text = adminText.bookings.detail;

export function NoteForm({ id, note }: { id: string; note: string | null }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    saveBookingNote.bind(null, id),
    { status: "idle" },
  );
  return (
    <form action={formAction}>
      <TextAreaField
        label={text.note}
        name="admin_note"
        defaultValue={note ?? ""}
        hint={text.noteHint}
        maxLength={2000}
      />
      <FormFooter state={state} pending={pending} label={text.saveNote} />
    </form>
  );
}
