"use client";

import { useEffect, useState } from "react";

type CategoryNavProps = {
  label: string;
  items: { slug: string; label: string }[];
};

/*
 * Sticky row of in-page links under the header. The category currently being
 * read is underlined (scroll-spy), so the bar doubles as a "you are here".
 */
export function CategoryNav({ label, items }: CategoryNavProps) {
  const [active, setActive] = useState(items[0]?.slug);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.slug))
      .filter((section): section is HTMLElement => section !== null);

    // A section counts as "current" while it crosses a band near the top of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current) setActive(current.target.id);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label={label}
      className="sticky top-[calc(4.5rem+var(--announce-h))] z-20 border-y border-line bg-paper"
    >
      <ul className="container-site flex gap-8 overflow-x-auto py-4 [scrollbar-width:none] sm:gap-10">
        {items.map((item) => (
          <li key={item.slug}>
            <a
              href={`#${item.slug}`}
              aria-current={active === item.slug ? "location" : undefined}
              className="link-line text-label whitespace-nowrap uppercase opacity-55 transition-opacity duration-300 [--line-trim:0.16em] hover:opacity-100 aria-[current=location]:opacity-100 aria-[current=location]:[background-size:calc(100%-0.16em)_1px]"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
