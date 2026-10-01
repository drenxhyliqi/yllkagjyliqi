import type { ReactNode } from "react";

import { RevealLines } from "@/components/ui/reveal-lines";

type PageIntroProps = {
  eyebrow: string;
  titleStart: string;
  titleEmphasis: string;
  text?: string;
  /** Extra content under the text, such as a link. */
  children?: ReactNode;
};

/** Opening of an inner page: label, two-line title, short introduction. */
export function PageIntro({
  eyebrow,
  titleStart,
  titleEmphasis,
  text,
  children,
}: PageIntroProps) {
  return (
    <header className="container-site pt-16 pb-14 lg:pt-24 lg:pb-20">
      <p className="eyebrow text-stone">{eyebrow}</p>
      <h1 className="reveal-lines mt-6 text-display-xl">
        <RevealLines
          lines={[titleStart, <em key="emphasis">{titleEmphasis}</em>]}
        />
      </h1>
      {text && (
        <p className="reveal mt-8 max-w-xl text-lead text-stone">{text}</p>
      )}
      {children}
    </header>
  );
}
