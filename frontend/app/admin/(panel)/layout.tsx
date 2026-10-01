import { AdminShell } from "@/components/admin/admin-shell";
import { Logo } from "@/components/ui/logo";
import { getBookingSummary } from "@/lib/admin/bookings";
import { requireAdmin } from "@/lib/auth";

/** Every signed-in admin page: session check plus navigation. */
export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  // The menu badge shouldn't take the whole panel down if this one call fails.
  const summary = await getBookingSummary().catch(() => null);

  return (
    <AdminShell
      logo={<Logo className="h-full w-auto" />}
      adminName={admin.name}
      pendingCount={summary?.pending ?? 0}
    >
      {children}
    </AdminShell>
  );
}
