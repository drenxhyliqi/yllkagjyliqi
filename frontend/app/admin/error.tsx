"use client";

import { unstable_isUnrecognizedActionError } from "next/navigation";

import { adminText } from "@/i18n/admin";

const text = adminText.error;

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  // A page left open across a deploy still calls the old version's actions;
  // only a full reload brings the new ones. Trying again would fail the same way.
  if (unstable_isUnrecognizedActionError(error)) {
    return (
      <main className="grid min-h-svh place-items-center px-(--gutter) text-center">
        <div className="max-w-sm">
          <h1 className="text-display-sm">{text.outdatedTitle}</h1>
          <p className="mt-4 text-stone">{text.outdatedText}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn btn-outline mt-8">
            {text.reload}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-svh place-items-center px-(--gutter) text-center">
      <div className="max-w-sm">
        <h1 className="text-display-sm">{text.title}</h1>
        <p className="mt-4 text-stone">{text.text}</p>
        <button type="button" onClick={reset} className="btn btn-outline mt-8">
          {text.retry}
        </button>
      </div>
    </main>
  );
}
