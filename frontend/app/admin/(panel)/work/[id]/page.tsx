import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPage } from "@/components/admin/admin-page";
import { WorkForm } from "@/components/admin/work/work-form";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";
import { getAdminWorkItem } from "@/lib/admin/portfolio";

const text = adminText.work.form;

export const metadata: Metadata = { title: text.editTitle };

export default async function EditWorkPage({ params }: PageProps<"/admin/work/[id]">) {
  const { id } = await params;
  const [item, catalog] = await Promise.all([getAdminWorkItem(id), getAdminCatalog()]);
  if (!item) notFound();

  return (
    <AdminPage
      title={item.title_sq}
      eyebrow={text.editTitle}
      back={{ href: "/admin/work", label: text.back }}
      actions={
        item.is_published && (
          <a
            href={`/sq/work/${item.slug}`}
            target="_blank"
            rel="noopener"
            className="text-small underline underline-offset-4"
          >
            {text.viewOnSite}
          </a>
        )
      }
    >
      <WorkForm item={item} categories={catalog.map((c) => ({ value: c.id, label: c.name_sq }))} />
    </AdminPage>
  );
}
