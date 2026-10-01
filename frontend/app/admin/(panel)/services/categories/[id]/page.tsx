import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPage } from "@/components/admin/admin-page";
import { CategoryForm } from "@/components/admin/services/category-form";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";

const text = adminText.services.categoryForm;

export const metadata: Metadata = { title: text.editTitle };

export default async function EditCategoryPage({ params }: PageProps<"/admin/services/categories/[id]">) {
  const [catalog, { id }] = await Promise.all([getAdminCatalog(), params]);
  const category = catalog.find((c) => c.id === id);
  if (!category) notFound();

  return (
    <AdminPage
      title={category.name_sq}
      eyebrow={text.editTitle}
      back={{ href: "/admin/services", label: adminText.services.form.back }}
    >
      <CategoryForm category={category} />
    </AdminPage>
  );
}
