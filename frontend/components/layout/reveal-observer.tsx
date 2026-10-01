"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

import { decideIntro, type IntroState } from "@/lib/intro";

declare global {
  interface Window {
    /** Set by the inline script in the locale layout before first paint. */
    __yllkaIntro?: IntroState;
  }
}

const SELECTOR =
  ".reveal:not([data-revealed]), .reveal-lines:not([data-revealed])";

/** Marks `.reveal` and `.reveal-lines` elements as they scroll into view. */
export function RevealObserver() {
  const pathname = usePathname();

  // Restore what the inline boot script set: React resets <html> attributes on
  // its development remount. Not-found pages are rendered in the browser, so
  // the boot script never ran there; make the same decision here, before paint.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.js = "";
    window.__yllkaIntro ??= decideIntro();
    root.dataset.intro = window.__yllkaIntro;
    // Switches off the CSS safety net that reveals everything after 4s.
    root.dataset.revealReady = "";
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    document
      .querySelectorAll(SELECTOR)
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
