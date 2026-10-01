/** Opening hours for one weekday (1 = Monday … 7 = Sunday). Times are "HH:MM:SS". */
export type DayHours = {
  weekday: number;
  is_open: boolean;
  opens_at: string | null;
  closes_at: string | null;
  /** Optional daily break, e.g. lunch: nothing can be booked across it. */
  break_starts_at: string | null;
  break_ends_at: string | null;
};

export type BookingRules = {
  slot_interval_minutes: number;
  min_notice_minutes: number;
  booking_window_days: number;
  /** Free time after every appointment. */
  buffer_minutes: number;
  /** Appointments at the client's place are offered. */
  home_visits: boolean;
  /** Blocked before and after a visit. */
  travel_minutes: number;
  home_visit_note_sq: string | null;
  home_visit_note_en: string | null;
  /** Clients can cancel or change online until this many hours before. */
  cancellation_notice_hours: number;
  policy_sq: string | null;
  policy_en: string | null;
};

export type DayOff = {
  id: string;
  /** "YYYY-MM-DD" */
  starts_on: string;
  ends_on: string;
  note: string | null;
};

export type Schedule = {
  timezone: string;
  hours: DayHours[];
  settings: BookingRules;
  days_off: DayOff[];
};
