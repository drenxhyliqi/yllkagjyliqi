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
