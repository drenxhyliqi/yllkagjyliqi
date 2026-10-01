import type { Metadata } from "next";

import { AdminPage, AdminSection } from "@/components/admin/admin-page";
import { AccountForm } from "@/components/admin/settings/account-form";
import { BusinessForm } from "@/components/admin/settings/business-form";
import { adminText } from "@/i18n/admin";
import { getAdminBusiness } from "@/lib/admin/business";
import { requireAdmin } from "@/lib/auth";

const text = adminText.settings;

export const metadata: Metadata = {
  title: adminText.nav.settings,
};

export default async function SettingsPage() {
  const [business, admin] = await Promise.all([getAdminBusiness(), requireAdmin()]);
  return (
    <AdminPage eyebrow={text.eyebrow} title={text.title} intro={text.intro}>
      <BusinessForm business={business} />
      <div className="mt-8 border-t border-line">
        <AdminSection title={adminText.account.title} text={adminText.account.text}>
          <AccountForm email={admin.email} />
        </AdminSection>
      </div>
    </AdminPage>
  );
}
