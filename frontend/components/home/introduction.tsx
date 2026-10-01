import { ArrowLink } from "@/components/ui/arrow-link";
import { Logo } from "@/components/ui/logo";
import { RevealLines } from "@/components/ui/reveal-lines";
import type { Dictionary } from "@/i18n/dictionaries/en";

type IntroductionProps = {
  copy: Dictionary["home"]["intro"];
  aboutHref: string;
};

/*
 * A short personal note from Yllka. Editorial layout: a hairline with the
 * label on the left, the statement to the right, and the note stepping in
 * beneath it, signed with the Yllka mark.
 */
export function Introduction({ copy, aboutHref }: IntroductionProps) {
  return (
    <section id="intro" aria-labelledby="intro-title" className="section-y">
      <div className="container-site">
        <div className="grid gap-y-8 border-t border-line pt-8 lg:grid-cols-12 lg:gap-x-8 lg:pt-12">
          <p className="eyebrow text-stone lg:col-span-3">{copy.eyebrow}</p>

          <div className="lg:col-span-9">
            <h2 id="intro-title" className="reveal-lines text-display-lg">
              <RevealLines
                lines={[
                  copy.titleStart,
                  <em key="emphasis">{copy.titleEmphasis}</em>,
                ]}
              />
            </h2>

            <div className="reveal mt-10 md:pl-[30%] lg:mt-16 lg:grid lg:grid-cols-9 lg:gap-x-8 lg:pl-0">
              <div className="lg:col-span-6 lg:col-start-4">
                <p className="text-lead text-stone">{copy.text}</p>
                <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
                  <Logo className="h-8 w-auto" />
                  <ArrowLink href={aboutHref}>{copy.link}</ArrowLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
