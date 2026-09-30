import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="grid min-h-svh place-items-center px-(--gutter) text-center">
      <div className="max-w-sm">
        <p className="eyebrow text-stone">404</p>
        <h1 className="mt-6 text-display-md">Page not found</h1>
        <p className="mt-4 text-stone">This part of the admin does not exist yet.</p>
        <Link href="/admin" className="btn btn-outline mt-10">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
