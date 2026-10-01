import type { Metadata } from "next";
import Link from "next/link";

import { AdminPage } from "@/components/admin/admin-page";
import { NewBookingForm } from "@/components/admin/bookings/new-booking-form";
import { adminText } from "@/i18n/admin";
import { getAdminCatalog } from "@/lib/admin/catalog";
import { businessToday, getAdminSchedule } from "@/lib/admin/schedule";

const text = adminText.bookings.form;

export const metadata: Metadata = { title: text.title };

export default async function NewBookingPage() {
  const [catalog, schedule] = await Promise.all([getAdminCatalog(), getAdminSchedule()]);
  const services = catalog.flatMap((category) =>
    category.services.map((service) => ({
      id: service.id,
      label: `${service.name_sq} · ${category.name_sq}`,
      duration: service.duration_minutes,
    })),
  );

  return (
    <AdminPage title={text.title} intro={text.text} back={{ href: "/admin/bookings", label: adminText.bookings.detail.back }}>
      {services.length > 0 ? (
        <NewBookingForm
          services={services}
          today={businessToday()}
          homeVisits={schedule.settings.home_visits}
        />
      ) : (
        <p className="text-stone">
          {text.needService}{" "}
          <Link href="/admin/services" className="underline underline-offset-4">
            {adminText.nav.services}
          </Link>
        </p>
      )}
    </AdminPage>
  );
}
