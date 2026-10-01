import type { Metadata } from "next";

import { AdminPage } from "@/components/admin/admin-page";
import { WorkForm } from "@/components/admin/work/work-form";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";

const text = adminText.work.form;

export const metadata: Metadata = { title: text.newTitle };

export default async function NewWorkPage() {
  const catalog = await getAdminCatalog();
  return (
    <AdminPage title={text.newTitle} back={{ href: "/admin/work", label: text.back }}>
      <WorkForm item={null} categories={catalog.map((c) => ({ value: c.id, label: c.name_sq }))} />
    </AdminPage>
  );
}
