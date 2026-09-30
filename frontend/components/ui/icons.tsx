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
