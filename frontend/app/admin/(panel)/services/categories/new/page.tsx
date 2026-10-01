import type { Metadata } from "next";

import { AdminPage } from "@/components/admin/admin-page";
import { CategoryForm } from "@/components/admin/services/category-form";
import { adminText } from "@/i18n/admin";

const text = adminText.services.categoryForm;

export const metadata: Metadata = { title: text.newTitle };

export default function NewCategoryPage() {
  return (
    <AdminPage title={text.newTitle} back={{ href: "/admin/services", label: adminText.services.form.back }}>
      <CategoryForm category={null} />
    </AdminPage>
  );
}
