import "server-only";

import { adminFetch, adminFetchOrNull } from "@/lib/admin/api";
import type { Booking, BookingSummary } from "@/types/booking";

export const BOOKING_VIEWS = ["upcoming", "pending", "today", "week", "past", "cancelled"] as const;
export type BookingView = (typeof BOOKING_VIEWS)[number];

/** A list view, or "reminders": confirmed appointments tomorrow. */
export function getBookings(view: BookingView | "reminders"): Promise<Booking[]> {
  return adminFetch<Booking[]>(`/api/admin/bookings?view=${view}`);
}

export function getBookingsBetween(from: string, to: string): Promise<Booking[]> {
  return adminFetch<Booking[]>(`/api/admin/bookings/calendar?from=${from}&to=${to}`);
}

export function getBookingSummary(): Promise<BookingSummary> {
  return adminFetch<BookingSummary>("/api/admin/bookings/summary");
}

export function getBooking(id: string): Promise<Booking | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve(null);
  return adminFetchOrNull<Booking>(`/api/admin/bookings/${id}`);
}
