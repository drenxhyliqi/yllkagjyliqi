import { ApiError, apiFetch } from "@/lib/api";
import type { Availability } from "@/types/booking";

/** Times a client can move their booking to (its own time counts as free). */
export async function GET(_request: Request, { params }: RouteContext<"/api/manage/[token]/availability">) {
  const { token } = await params;
  try {
    const availability = await apiFetch<Availability>(
      `/api/bookings/manage/${encodeURIComponent(token)}/availability`,
    );
    return Response.json(availability, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof ApiError && error.status === 404 ? 404 : 503;
    return Response.json({ message: "Availability unavailable." }, { status });
  }
}
