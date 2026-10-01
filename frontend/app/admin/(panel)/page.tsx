import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/app/admin/actions";
import { Logo } from "@/components/ui/logo";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  // The layout's title template only applies to child segments.
  title: { absolute: "Dashboard — Yllka Admin" },
};

// Placeholder until the admin phase: confirms sign-in works end to end.
export default async function AdminHome() {
  const admin = await requireAdmin();

  return (
    <div className="container-site py-8">
      <header className="flex items-center justify-between border-b border-line pb-6">
        <Link href="/admin" aria-label="Dashboard">
          <Logo className="h-8 w-auto" />
        </Link>
        <form action={logout}>
          <button type="submit" className="btn btn-outline btn-sm">
            Sign out
          </button>
        </form>
      </header>

      <main className="py-20">
        <p className="eyebrow text-stone">Admin</p>
        <h1 className="mt-4 text-display-md">Welcome, {admin.name}</h1>
        <p className="mt-4 max-w-md text-stone">
          You are signed in. Services, work and appointments will be managed
          from here.
        </p>
        <Link href="/" className="btn btn-primary mt-10">
          View website
        </Link>
      </main>
    </div>
  );
}
