import type { PriceType } from "@/types/service";

/** Free start times ("HH:MM", business time) per "YYYY-MM-DD" day. */
export type Availability = {
  timezone: string;
  first_day: string;
  last_day: string;
  days: Record<string, string[]>;
  /** Every other time of open days, shown greyed out with the reason. */
  unavailable: Record<string, UnavailableTime[]>;
};

export type UnavailableTime = {
  time: string;
  /** booked: a confirmed appointment · break: daily break · notice: past or too soon. */
  reason: "booked" | "break" | "notice";
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed"
  | "no_show"
  /** A request nobody answered before its time passed. */
  | "expired";

/** A booking as the admin sees it. Dates and times are already in business time. */
export type Booking = {
  id: string;
  reference: string;
  status: BookingStatus;
  source: "website" | "admin";
  service_id: string | null;
  service_name: string;
  service_name_en: string | null;
  price: number | null;
  price_type: PriceType;
  start_time: string;
  end_time: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" */
  start: string;
  end: string;
  duration_minutes: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_note: string | null;
  locale: "sq" | "en";
  admin_message: string | null;
  admin_note: string | null;
  created_at: string;
  decided_at: string | null;
  /** Other pending or confirmed bookings at an overlapping time. */
  conflicts: BookingConflict[];
  items: BookingItem[];
  location: "studio" | "client";
  address: string | null;
  /** Travel and preparation time around the appointment ("HH:MM"). */
  block_start: string;
  block_end: string;
  /** For the client's "manage my booking" link. */
  manage_token: string;
  cancelled_by: "client" | "admin" | null;
  /** Set when the client moved the time themselves. */
  client_changed_at: string | null;
  reminder_sent_at: string | null;
};

export type BookingItem = {
  service_id: string | null;
  name_sq: string;
  name_en: string | null;
  /** Per person. */
  duration_minutes: number;
  price: number | null;
  price_type: PriceType;
  quantity: number;
};

export type BookingConflict = {
  id: string;
  reference: string;
  status: BookingStatus;
  customer_name: string;
  service_name: string;
  start: string;
  end: string;
};

export type BookingSummary = {
  pending: number;
  today: number;
  upcoming: number;
  /** Upcoming bookings that overlap another and need a decision. */
  conflicts: number;
  /** Confirmed appointments tomorrow still waiting for a reminder. */
  reminders: number;
};

/** What a client sees through their private "manage my booking" link. */
export type ManagedBooking = {
  reference: string;
  status: BookingStatus;
  date: string;
  start: string;
  end: string;
  items: {
    name_sq: string;
    name_en: string | null;
    quantity: number;
    duration_minutes: number;
  }[];
  location: "studio" | "client";
  address: string | null;
  customer_name: string;
  locale: "sq" | "en";
  can_change: boolean;
  change_deadline: string;
  policy: string | null;
  business_name: string;
  business_phone: string | null;
};
