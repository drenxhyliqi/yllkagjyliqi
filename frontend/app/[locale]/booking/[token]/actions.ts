"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { ApiError, apiFetch } from "@/lib/api";

export type ManageResult = { status: "idle" | "done" } | { status: "error"; error: "taken" | "tooLate" | "generic" | "tooMany" };

async function clientIp(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  );
}

async function send(token: string, path: string, json?: unknown): Promise<ManageResult> {
  try {
    await apiFetch(`/api/bookings/manage/${encodeURIComponent(token)}/${path}`, {
      method: "POST",
      headers: { "X-Client-IP": await clientIp() },
      json,
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 0;
    if (status === 409) return { status: "error", error: path === "cancel" ? "tooLate" : "taken" };
    if (status === 429) return { status: "error", error: "tooMany" };
    return { status: "error", error: "generic" };
  }
  revalidatePath("/[locale]/booking/[token]", "page");
  return { status: "done" };
}

export async function cancelBooking(token: string): Promise<ManageResult> {
  return send(token, "cancel");
}

export async function moveBooking(token: string, date: string, time: string): Promise<ManageResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { status: "error", error: "taken" };
  }
  return send(token, "reschedule", { date, time });
}
