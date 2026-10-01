type IconProps = {
  className?: string;
};

/** Hairline person outline, used for the admin login link. */
export function UserIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="8.25" r="3.75" />
      <path d="M4.75 20.25c.9-3.6 3.75-5.75 7.25-5.75s6.35 2.15 7.25 5.75" />
    </svg>
  );
}

/** Hairline arrow for "View more" style links. */
export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M1 6h21M17 1.5 22 6l-5 4.5" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.1" cy="6.9" r="0.4" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M13.5 20.5v-7.25h2.5l.4-3H13.5V8.4c0-.85.3-1.45 1.5-1.45h1.5V4.3a19 19 0 0 0-2.2-.12c-2.2 0-3.7 1.34-3.7 3.8v2.27H8.1v3h2.5v7.25" />
    </svg>
  );
}

/** Hairline arrow pointing up, for "Back to top". */
export function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 10 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M5 11V1.5M1.5 5 5 1.5 8.5 5" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M5.5 3.5h3l1.5 4-2 1.25a11 11 0 0 0 5.25 5.25L14.5 12l4 1.5v3a2 2 0 0 1-2 2A13 13 0 0 1 3.5 5.5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="3.5" y="5" width="17" height="15" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </svg>
  );
}

/** Admin: dashboard. */
export function GridIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="3.5" y="3.5" width="7" height="7" />
      <rect x="13.5" y="3.5" width="7" height="7" />
      <rect x="3.5" y="13.5" width="7" height="7" />
      <rect x="13.5" y="13.5" width="7" height="7" />
    </svg>
  );
}

/** Admin: services. */
export function ListIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
      <path d="M3.5 6.5h1M3.5 12h1M3.5 17.5h1" />
    </svg>
  );
}

/** Admin: work / portfolio. */
export function ImageIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="3.5" y="4.5" width="17" height="15" />
      <circle cx="9" cy="10" r="1.75" />
      <path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4" />
    </svg>
  );
}

/** Admin: settings. */
export function SlidersIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </svg>
  );
}

/** Opens elsewhere, such as the public site. */
export function ExternalIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M13.5 4.5h6v6M19.5 4.5 11 13" />
      <path d="M17.5 13.5v6h-13v-13h6" />
    </svg>
  );
}

/** Sign out. */
export function SignOutIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M14.5 4.5h-10v15h10" />
      <path d="M10 12h10M16.5 8.5 20 12l-3.5 3.5" />
    </svg>
  );
}

/** Small chevron for native selects. */
export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

/** Tray with an incoming line, for booking requests. */
export function InboxIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M3.75 13.5h4.5l1.5 2.25h4.5l1.5-2.25h4.5" />
      <path d="M5.6 5.25h12.8l1.85 8.25v5.25H3.75V13.5z" />
    </svg>
  );
}
