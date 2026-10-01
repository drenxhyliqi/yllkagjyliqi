import "server-only";

import { adminFetch } from "@/lib/admin/api";
import type { AdminCategory } from "@/types/admin-content";

/** Every category with every service, hidden ones included. */
export function getAdminCatalog(): Promise<AdminCategory[]> {
  return adminFetch<AdminCategory[]>("/api/admin/catalog");
}
