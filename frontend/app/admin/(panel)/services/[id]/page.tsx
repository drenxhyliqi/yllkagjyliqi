import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPage } from "@/components/admin/admin-page";
import { ServiceForm } from "@/components/admin/services/service-form";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";

const text = adminText.services.form;

export const metadata: Metadata = { title: text.editTitle };

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  const [catalog, { id }] = await Promise.all([getAdminCatalog(), params]);
  const service = catalog.flatMap((c) => c.services).find((s) => s.id === id);
  if (!service) notFound();

  return (
    <AdminPage title={service.name_sq} eyebrow={text.editTitle} back={{ href: "/admin/services", label: text.back }}>
      <ServiceForm
        service={service}
        categories={catalog.map((c) => ({ value: c.id, label: c.name_sq }))}
      />
    </AdminPage>
  );
}
