import type { Metadata } from "next";

import { AdminPage, AdminSection } from "@/components/admin/admin-page";
import { DaysOff } from "@/components/admin/schedule/days-off";
import { HoursForm } from "@/components/admin/schedule/hours-form";
import { RulesForm } from "@/components/admin/schedule/rules-form";
import { adminText } from "@/i18n/admin";
import { businessToday, getAdminSchedule } from "@/lib/admin/schedule";

const text = adminText.schedule;

export const metadata: Metadata = {
  title: adminText.nav.appointments,
};

export default async function AppointmentsPage() {
  const schedule = await getAdminSchedule();

  return (
    <AdminPage eyebrow={text.eyebrow} title={text.title} intro={text.intro}>
      <AdminSection title={text.daysOff.title} text={text.daysOff.text}>
        <DaysOff daysOff={schedule.days_off} today={businessToday(schedule.timezone)} />
      </AdminSection>
      <AdminSection title={text.hours.title} text={text.hours.text}>
        <HoursForm hours={schedule.hours} />
      </AdminSection>
      <AdminSection title={text.rules.title} text={text.rules.text}>
        <RulesForm rules={schedule.settings} />
      </AdminSection>
    </AdminPage>
  );
}
