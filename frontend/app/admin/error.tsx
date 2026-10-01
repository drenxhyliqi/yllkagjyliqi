"use client";

import { adminText } from "@/i18n/admin";

const text = adminText.error;

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
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
