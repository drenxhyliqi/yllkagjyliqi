import type { Metadata } from "next";

import { fontVariables } from "@/app/fonts";

import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin — Yllka", template: "%s — Yllka Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
