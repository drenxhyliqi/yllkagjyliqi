import Image from "next/image";

import type { Dictionary } from "@/i18n/dictionaries/en";
import { RevealLines } from "@/components/ui/reveal-lines";
import type { ImageAsset } from "@/types/image";

type ApproachProps = {
  copy: Dictionary["home"]["approach"];
  image: ImageAsset;
};

const numerals = ["I", "II", "III", "IV", "V"];

/*
 * How Yllka works, in three short notes. A tall photograph on the left and
 * the notes on the right, each opened by a roman numeral on a hairline.
 * On phones the photograph is shallower so the notes arrive quickly.
 */
export function Approach({ copy, image }: ApproachProps) {
  return (
    <section aria-labelledby="approach-title" className="bg-sand section-y">
      <div className="container-site grid gap-y-12 lg:grid-cols-12 lg:items-center lg:gap-x-8">
        <div className="reveal relative aspect-[4/3] overflow-hidden bg-cream sm:aspect-[3/2] lg:col-span-5 lg:aspect-[4/5]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 64rem) 40vw, 100vw"
            className="object-cover object-[45%_50%]"
          />
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="eyebrow text-stone">{copy.eyebrow}</p>
          <h2 id="approach-title" className="reveal-lines mt-6 text-display-lg">
            <RevealLines
              lines={[
                copy.titleStart,
                <em key="emphasis">{copy.titleEmphasis}</em>,
              ]}
            />
          </h2>

          <ol className="mt-12 space-y-8 lg:mt-16 lg:space-y-10">
            {copy.steps.map((step, index) => (
              <li key={step.title} className="reveal">
                <div className="flex items-center gap-4" aria-hidden="true">
                  <span className="font-display text-lg italic">
                    {numerals[index]}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <h3 className="mt-4 text-display-sm">{step.title}</h3>
                <p className="mt-2 max-w-md text-stone">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
