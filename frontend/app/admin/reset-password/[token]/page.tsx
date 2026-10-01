import type { Metadata } from "next";

import { AuthCard } from "@/components/admin/auth/auth-card";
import { ResetForm } from "@/components/admin/auth/reset-form";
import { adminText } from "@/i18n/admin";

const text = adminText.reset;

export const metadata: Metadata = {
  title: text.title,
  // The token is in the address: never send it to other sites.
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({ params }: PageProps<"/admin/reset-password/[token]">) {
  const { token } = await params;
  return (
    <AuthCard title={text.title} text={text.text}>
      <ResetForm token={token} />
    </AuthCard>
  );
}
