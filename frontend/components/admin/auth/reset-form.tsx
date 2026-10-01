"use client";

import Link from "next/link";
import { useActionState } from "react";

import { finishReset, type ResetState } from "@/app/admin/reset-actions";
import { TextField } from "@/components/admin/fields";
import { adminText } from "@/i18n/admin";

const text = adminText.reset;

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    finishReset.bind(null, token),
    { status: "idle" },
  );
  const errorFor = (field: string) =>
    state.status === "error" && state.field === field ? state.message : undefined;

  if (state.status === "done") {
    return (
      <div className="text-center">
        <p role="status">{text.done}</p>
        <Link href="/admin/login" className="btn btn-primary mt-10 w-full">
          {text.toLogin}
        </Link>
      </div>
    );
  }

  if (state.status === "error" && state.field === "token") {
    return (
      <div className="text-center">
        <p role="alert" className="text-error">
          {state.message}
        </p>
        <Link href="/admin/forgot-password" className="btn btn-outline mt-10 w-full">
          {text.askAgain}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <TextField
        label={text.password}
        name="password"
        type="password"
        required
        minLength={10}
        autoComplete="new-password"
        hint={text.passwordHint}
        error={errorFor("password")}
      />
      <TextField
        label={text.repeat}
        name="repeat"
        type="password"
        required
        autoComplete="new-password"
        error={errorFor("repeat")}
      />
      {state.status === "error" && !state.field && (
        <p role="alert" className="text-small text-error">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? text.saving : text.save}
      </button>
    </form>
  );
}
