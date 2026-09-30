"use client";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-svh place-items-center px-(--gutter) text-center">
      <div className="max-w-sm">
        <h1 className="text-display-sm">Something went wrong</h1>
        <p className="mt-4 text-stone">
          The admin could not reach the server. Please try again in a moment.
        </p>
        <button type="button" onClick={reset} className="btn btn-outline mt-8">
          Try again
        </button>
      </div>
    </main>
  );
}
