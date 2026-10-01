import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/ui/logo";
import { adminText } from "@/i18n/admin";
import { getAdmin } from "@/lib/auth";

const text = adminText.login;

export const metadata: Metadata = {
  title: text.title,
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  // Already signed in: go straight to the dashboard. If the API is down, show the form.
  const admin = await getAdmin().catch(() => null);
  if (admin) redirect("/admin");

  const { next } = await searchParams;

  return (
    <main className="grid min-h-svh place-items-center px-(--gutter) py-16">
      <div className="w-full max-w-sm">
        <Link href="/" aria-label={text.back} className="mx-auto block w-fit">
          <Logo className="h-10 w-auto" />
        </Link>

        <h1 className="mt-14 text-center text-display-md">{text.title}</h1>
        <p className="mt-3 text-center text-stone">
          {text.text}
        </p>

        <LoginForm next={typeof next === "string" ? next : undefined} />

        <p className="mt-8 text-center">
          <Link href="/admin/forgot-password" className="link-line text-small">
            {text.forgot}
          </Link>
        </p>

        <p className="mt-6 text-center">
          <Link href="/" className="link-line text-small text-stone">
            {text.back}
          </Link>
        </p>
      </div>
    </main>
  );
}
