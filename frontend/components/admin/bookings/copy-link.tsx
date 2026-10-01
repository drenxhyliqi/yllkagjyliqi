"use client";

import { useState } from "react";

/** Shows a link with a button that copies it. */
export function CopyLink({ url, label, copied }: { url: string; label: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <a href={url} target="_blank" rel="noopener" className="min-w-0 truncate text-small text-stone underline-offset-4 hover:underline">
        {url.replace(/^https?:\/\//, "")}
      </a>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard
            ?.writeText(url)
            .then(() => setDone(true))
            .catch(() => setDone(false))
        }
        className="min-h-11 shrink-0 cursor-pointer text-small underline underline-offset-4"
      >
        {done ? copied : label}
      </button>
    </div>
  );
}
