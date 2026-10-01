/** ISO weekday: 1 = Monday … 7 = Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Opening hours for one weekday, as local business time ("09:00"). Null times mean closed. */
export type OpeningHours = {
  weekday: Weekday;
  opens: string | null;
  closes: string | null;
};

/** Public contact details and hours, managed by Yllka in the admin settings. */
export type BusinessInfo = {
  name: string;
  phone: string | null;
  email: string | null;
  instagram: { handle: string; url: string } | null;
  facebook: { url: string } | null;
  address: { street: string; city: string } | null;
  mapsUrl: string | null;
  /** One entry per weekday, Monday first. */
  hours: OpeningHours[];
};
