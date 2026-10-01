import "server-only";

import { adminFetch, adminFetchOrNull } from "@/lib/admin/api";
import type { AdminWork } from "@/types/admin-content";

export function getAdminWork(): Promise<AdminWork[]> {
  return adminFetch<AdminWork[]>("/api/admin/portfolio");
}

export function getAdminWorkItem(id: string): Promise<AdminWork | null> {
  // Ids are UUIDs; anything else can't exist.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve(null);
  return adminFetchOrNull<AdminWork>(`/api/admin/portfolio/${id}`);
}
