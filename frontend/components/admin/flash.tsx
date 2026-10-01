"use client";

import { useEffect, useState } from "react";

/**
 * A short confirmation after a save that returned to a list, e.g. "Saved.".
 * Reads `?saved=` once, then removes it so a reload doesn't show it again.
 */
export function Flash({ messages }: { messages: Record<string, string> }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const key = url.searchParams.get("saved");
    if (!key) return;
    url.searchParams.delete("saved");
    window.history.replaceState(window.history.state, "", url);
    const text = messages[key];
    if (!text) return;
    // Shown after mount so the server render never includes it.
    queueMicrotask(() => setMessage(text));
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [messages]);

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-(--gutter) lg:bottom-8"
    >
      {message && (
        <p className="animate-[fade-up_400ms_var(--ease-soft)] bg-ink px-5 py-3 text-small text-paper shadow-[0_8px_24px_rgb(17_17_17/0.18)]">
          {message}
        </p>
      )}
    </div>
  );
}
