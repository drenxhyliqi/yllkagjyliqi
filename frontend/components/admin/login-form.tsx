"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/admin/actions";
import { adminText } from "@/i18n/admin";

const text = adminText.login;

const ERROR_ID = "login-error";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined,
  );
  const invalid = state !== undefined;

  return (
    <form action={formAction} className="mt-10">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="space-y-6">
        <div>
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
            defaultValue={state?.email}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? ERROR_ID : undefined}
            className="input mt-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-label text-stone uppercase">
            {text.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? ERROR_ID : undefined}
            className="input mt-2"
          />
        </div>
      </div>

      <p
        id={ERROR_ID}
        role="alert"
        className="mt-5 min-h-[1.6em] text-small text-error"
      >
        {state?.message}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary mt-3 w-full"
      >
        {pending ? text.submitting : text.submit}
      </button>
    </form>
  );
}
