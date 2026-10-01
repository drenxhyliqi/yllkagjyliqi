import "server-only";

import { adminFetch } from "@/lib/admin/api";

export type SystemStatus = { emails: boolean; images: "local" | "cloudinary" };

/** What is switched on: emails through Resend, photos on Cloudinary. */
export function getSystemStatus(): Promise<SystemStatus> {
  return adminFetch<SystemStatus>("/api/admin/system");
}
