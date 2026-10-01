import type { Metadata } from "next";

import { AuthCard } from "@/components/admin/auth/auth-card";
import { ForgotForm } from "@/components/admin/auth/forgot-form";
import { adminText } from "@/i18n/admin";

const text = adminText.reset;

export const metadata: Metadata = { title: text.forgotTitle };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title={text.forgotTitle} text={text.forgotText}>
      <ForgotForm />
    </AuthCard>
  );
}
