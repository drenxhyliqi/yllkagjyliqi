"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { Dictionary } from "@/i18n/dictionaries/en";
import {
  getConsent,
  OPEN_CONSENT_EVENT,
  saveConsent,
  type Consent,
} from "@/lib/consent";
import { cn } from "@/lib/utils";

/** Pages with a hero mark it with this attribute; the banner waits until it has been scrolled past. */
const TRIGGER = "[data-consent-trigger]";
/** Pages without a hero show the banner after a short pause instead. */
const FALLBACK_DELAY = 1500;
const EXIT_DURATION = 400;

type CookieConsentProps = {
  copy: Dictionary["consent"];
  policyHref: string;
};

export function CookieConsent({ copy, policyHref }: CookieConsentProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  const show = (focus = false) => {
    setMounted(true);
    // Next frame, so the entrance transition runs.
    requestAnimationFrame(() => {
      setVisible(true);
      if (focus) firstButtonRef.current?.focus();
    });
  };

  // Wait for the visitor to scroll past the hero (or a short pause elsewhere).
  useEffect(() => {
    if (getConsent()) return;

    const trigger = document.querySelector(TRIGGER);
    if (!trigger) {
      const timer = window.setTimeout(() => show(), FALLBACK_DELAY);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
        observer.disconnect();
        show();
      }
    });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [pathname]);

  // "Cookie settings" in the footer reopens the banner at any time.
  useEffect(() => {
    const reopen = () => show(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const choose = (consent: Consent) => {
    saveConsent(consent);
    setVisible(false);
    window.setTimeout(() => setMounted(false), EXIT_DURATION);
  };

  if (!mounted) return null;

  return (
    <section
      aria-label={copy.title}
      className={cn(
        "fixed inset-x-(--gutter) bottom-(--gutter) z-40 border border-line bg-paper p-6 shadow-[0_24px_60px_-24px_rgb(17_17_17/0.35)] transition-[opacity,translate] duration-400 ease-soft sm:right-auto sm:max-w-md sm:p-7",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <p className="eyebrow text-stone">{copy.title}</p>
      <p className="mt-3 text-small text-ink/80">
        {copy.text}{" "}
        <Link
          href={policyHref}
          className="link-line text-ink [background-size:100%_1px]"
        >
          {copy.policyLink}
        </Link>
      </p>
      {/* Buttons size to their labels and stack when they no longer fit side by side. */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          ref={firstButtonRef}
          type="button"
          onClick={() => choose("all")}
          className="btn btn-primary btn-sm grow"
        >
          {copy.accept}
        </button>
        <button
          type="button"
          onClick={() => choose("necessary")}
          className="btn btn-outline btn-sm grow"
        >
          {copy.necessary}
        </button>
      </div>
    </section>
  );
}
