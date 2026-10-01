/**
 * Keeps hyphenated words such as "make-up" on one line; browsers may
 * otherwise break after the hyphen ("make- / up").
 */
export function NoBreakHyphens({ text }: { text: string }) {
  return text.split(/(\S*-\S*)/).map((part, index) =>
    part.includes("-") ? (
      <span key={index} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
