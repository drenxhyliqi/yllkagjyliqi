"use client";

import { useActionState, useState } from "react";

import { changeEmail, changePassword } from "@/app/admin/(panel)/settings/actions";
import { TextField } from "@/components/admin/fields";
import { FormFooter } from "@/components/admin/form-footer";
import { adminText } from "@/i18n/admin";
import type { FormState } from "@/lib/admin/mutate";

const text = adminText.account;

function useForm(action: (previous: FormState, formData: FormData) => Promise<FormState>) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, { status: "idle" });
  const errorFor = (field: string) =>
    state.status === "error" && state.field === field ? state.message : undefined;
  // The message under the button only when it isn't already shown at a field.
  const footer: FormState = state.status === "error" && state.field ? { status: "idle" } : state;
  return { state, formAction, pending, errorFor, footer };
}

function PasswordField(props: React.ComponentProps<typeof TextField> & { shown: boolean }) {
  const { shown, ...rest } = props;
  return <TextField {...rest} type={shown ? "text" : "password"} autoCapitalize="none" spellCheck={false} />;
}

export function AccountForm({ email }: { email: string }) {
  const emailForm = useForm(changeEmail);
  const passwordForm = useForm(changePassword);
  const [shown, setShown] = useState(false);

  return (
    <div className="space-y-12">
      <form action={emailForm.formAction} className="space-y-5">
        <h3 className="text-label text-stone uppercase">{text.email}</h3>
        <p className="-mt-3 break-all">{email}</p>
        <TextField
          label={text.newEmail}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          error={emailForm.errorFor("email")}
        />
        <PasswordField
          shown={false}
          label={text.currentPassword}
          name="current_password"
          required
          autoComplete="current-password"
          hint={text.currentPasswordHint}
          error={emailForm.errorFor("current_password")}
        />
        <FormFooter state={emailForm.footer} pending={emailForm.pending} label={text.saveEmail} />
      </form>

      <form action={passwordForm.formAction} className="space-y-5 border-t border-line pt-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-label text-stone uppercase">{text.password}</h3>
          <button
            type="button"
            onClick={() => setShown((value) => !value)}
            aria-pressed={shown}
            className="min-h-11 cursor-pointer text-small underline underline-offset-4"
          >
            {shown ? text.hide : text.show}
          </button>
        </div>
        <PasswordField
          shown={shown}
          label={text.currentPassword}
          name="current_password"
          required
          autoComplete="current-password"
          error={passwordForm.errorFor("current_password")}
        />
        <PasswordField
          shown={shown}
          label={text.newPassword}
          name="new_password"
          required
          minLength={10}
          autoComplete="new-password"
          hint={text.newPasswordHint}
          error={passwordForm.errorFor("new_password")}
        />
        <PasswordField
          shown={shown}
          label={text.repeatPassword}
          name="repeat_password"
          required
          autoComplete="new-password"
          error={passwordForm.errorFor("repeat_password")}
        />
        <FormFooter state={passwordForm.footer} pending={passwordForm.pending} label={text.savePassword} />
        {passwordForm.state.status === "saved" && (
          <p role="status" className="text-small">
            {text.passwordSaved}
          </p>
        )}
      </form>
    </div>
  );
}
