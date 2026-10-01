import type { NextRequest } from "next/server";

import { ApiError, apiFetch } from "@/lib/api";
import type { Availability } from "@/types/booking";

// "<uuid>:<people>" pairs, comma-separated.
const ITEMS = /^[0-9a-f-]{36}:\d{1,2}(,[0-9a-f-]{36}:\d{1,2}){0,5}$/i;

/** Times for the chosen services, for the booking wizard. Never cached: they change with every booking. */
export async function GET(request: NextRequest) {
  const items = request.nextUrl.searchParams.get("items") ?? "";
  const location = request.nextUrl.searchParams.get("location") === "client" ? "client" : "studio";
  if (!ITEMS.test(items)) {
    return Response.json({ message: "Unknown services." }, { status: 400 });
  }
  try {
    const availability = await apiFetch<Availability>(
      `/api/availability?items=${encodeURIComponent(items)}&location=${location}`,
    );
    return Response.json(availability, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof ApiError && error.status === 422 ? 404 : 503;
    return Response.json({ message: "Availability unavailable." }, { status });
  }
}
