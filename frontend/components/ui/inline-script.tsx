"use client";

/**
 * An inline script that runs during HTML parsing on hard loads only.
 * On the client it renders as text/plain, which React accepts without its
 * "script tag while rendering" warning and which the browser ignores.
 * See the Next.js guide "Preventing flash before hydration".
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
