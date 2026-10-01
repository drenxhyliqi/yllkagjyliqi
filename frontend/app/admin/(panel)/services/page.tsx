import type { Metadata } from "next";
import Link from "next/link";

import { AdminPage } from "@/components/admin/admin-page";
import { Flash } from "@/components/admin/flash";
import { ServicesBoard } from "@/components/admin/services/services-board";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";

const text = adminText.services;

export const metadata: Metadata = {
  title: adminText.nav.services,
};

export default async function ServicesPage() {
  const catalog = await getAdminCatalog();

  return (
    <AdminPage
      eyebrow={text.eyebrow}
      title={text.title}
      intro={text.intro}
      actions={
        catalog.length > 0 && (
          <>
            <Link href="/admin/services/new" className="btn btn-sm btn-primary grow sm:grow-0">
              {text.newService}
            </Link>
            <Link href="/admin/services/categories/new" className="btn btn-sm btn-outline grow sm:grow-0">
              {text.newCategory}
            </Link>
          </>
        )
      }
    >
      <ServicesBoard key={catalog.map((c) => c.id).join()} catalog={catalog} />
      <Flash
        messages={{
          service: adminText.common.saved,
          category: adminText.common.saved,
          deleted: adminText.common.deleted,
        }}
      />
    </AdminPage>
  );
}
