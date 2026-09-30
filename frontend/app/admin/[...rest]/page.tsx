import { notFound } from "next/navigation";

/** Unknown admin paths render the admin 404 page. */
export default function AdminCatchAll() {
  notFound();
}
