import type { CSSProperties, ReactNode } from "react";

/**
 * Renders each line of a heading inside its own mask, so the lines can slide
 * up in sequence. Put `reveal-lines` on the heading for a scroll reveal, or
 * `hero-intro` for the timed hero entrance (see globals.css).
 */
export function RevealLines({ lines }: { lines: ReactNode[] }) {
  return lines.map((line, index) => (
    <span key={index} className="reveal-line">
      <span style={{ "--i": index } as CSSProperties}>{line}</span>
    </span>
  ));
}
