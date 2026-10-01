import type { Metadata } from "next";

import { AdminPage } from "@/components/admin/admin-page";
import { ServiceForm } from "@/components/admin/services/service-form";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";

const text = adminText.services.form;

export const metadata: Metadata = { title: text.newTitle };

export default async function NewServicePage({ searchParams }: PageProps<"/admin/services/new">) {
  const [catalog, { category }] = await Promise.all([getAdminCatalog(), searchParams]);
  const back = { href: "/admin/services", label: text.back };

  return (
    <AdminPage title={text.newTitle} back={back}>
      {catalog.length === 0 ? (
        <p className="text-stone">{text.needCategory}</p>
      ) : (
        <ServiceForm
          service={null}
          categories={catalog.map((c) => ({ value: c.id, label: c.name_sq }))}
          defaultCategory={typeof category === "string" ? category : undefined}
        />
      )}
    </AdminPage>
  );
}
