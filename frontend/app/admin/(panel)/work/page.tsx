import type { Metadata } from "next";
import Link from "next/link";

import { AdminPage } from "@/components/admin/admin-page";
import { Flash } from "@/components/admin/flash";
import { WorkGrid } from "@/components/admin/work/work-grid";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";
import { getAdminWork } from "@/lib/admin/portfolio";

const text = adminText.work;

export const metadata: Metadata = {
  title: adminText.nav.work,
};

export default async function WorkPage() {
  const [items, catalog] = await Promise.all([getAdminWork(), getAdminCatalog()]);
  const categories = Object.fromEntries(catalog.map((c) => [c.id, c.name_sq]));

  return (
    <AdminPage
      eyebrow={text.eyebrow}
      title={text.title}
      intro={text.intro}
      actions={
        items.length > 0 && (
          <Link href="/admin/work/new" className="btn btn-sm btn-primary grow sm:grow-0">
            {text.add}
          </Link>
        )
      }
    >
      <WorkGrid key={items.map((item) => item.id).join()} items={items} categories={categories} />
      <Flash messages={{ work: adminText.common.saved, deleted: adminText.common.deleted }} />
    </AdminPage>
  );
}
