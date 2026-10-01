"use client";

import { useEffect, useRef, useState } from "react";

import { ArrowUpIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** Shown after scrolling this many viewport heights. */
const SHOW_AFTER = 1.2;
/** The square's outline, starting top-centre and running clockwise. */
const OUTLINE = "M20 0.5H39.5V39.5H0.5V0.5H20";

/*
 * Appears once the visitor is well into the page. The hairline outline fills
 * with reading progress; it is updated through a CSS variable rather than
 * React state, so scrolling never re-renders the component.
 */
export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      buttonRef.current?.style.setProperty("--progress", progress.toFixed(4));
      setVisible(window.scrollY > window.innerHeight * SHOW_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    // Keyboard and screen-reader users continue from the top of the content.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      className={cn(
        "group fixed right-(--gutter) bottom-(--gutter) z-30 grid size-10 cursor-pointer place-items-center bg-paper text-ink shadow-[0_10px_28px_-14px_rgb(17_17_17/0.35)] transition-[opacity,translate,visibility] duration-500 ease-soft",
        visible
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-3 opacity-0",
      )}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
        className="absolute inset-0"
      >
        <path d={OUTLINE} strokeOpacity={0.15} />
        <path
          d={OUTLINE}
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: "calc(1 - var(--progress, 0))" }}
        />
      </svg>
      <ArrowUpIcon className="h-3 transition-transform duration-300 ease-soft group-hover:-translate-y-0.5" />
    </button>
  );
}
