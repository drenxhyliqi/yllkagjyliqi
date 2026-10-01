"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestReset, type ResetState } from "@/app/admin/reset-actions";
import { adminText } from "@/i18n/admin";

const text = adminText.reset;

export function ForgotForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(requestReset, { status: "idle" });

  if (state.status === "done") {
    return (
      <div className="text-center">
        <p role="status">{text.sent}</p>
        <Link href="/admin/login" className="btn btn-outline mt-10 w-full">
          {text.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <label htmlFor="email" className="text-label text-stone uppercase">
        {text.email}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        aria-invalid={state.status === "error" || undefined}
        aria-describedby={state.status === "error" ? "forgot-error" : undefined}
        className="input mt-2"
      />
      <p id="forgot-error" role="alert" className="mt-4 min-h-[1.6em] text-small text-error">
        {state.status === "error" && state.message}
      </p>
      <button type="submit" disabled={pending} className="btn btn-primary mt-2 w-full">
        {pending ? text.sending : text.send}
      </button>
      <p className="mt-10 text-center">
        <Link href="/admin/login" className="link-line text-small text-stone">
          {text.backToLogin}
        </Link>
      </p>
    </form>
  );
}
