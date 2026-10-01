"use client";

import { OPEN_CONSENT_EVENT } from "@/lib/consent";

/** Reopens the cookie banner so a visitor can change their choice. */
export function CookieSettingsButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
      className={className}
    >
      {label}
    </button>
  );
}
