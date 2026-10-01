import "server-only";

import { adminFetch } from "@/lib/admin/api";
import type { AdminBusiness } from "@/types/admin-content";

export function getAdminBusiness(): Promise<AdminBusiness> {
  return adminFetch<AdminBusiness>("/api/admin/business");
}
