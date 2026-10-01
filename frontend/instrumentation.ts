import * as Sentry from "@sentry/nextjs";

import { sentryOptions } from "@/lib/sentry-options";

/** Error monitoring on the server. Off unless SENTRY_DSN is set. */
export async function register() {
  const dsn = process.env.SENTRY_DSN;
  if (dsn) Sentry.init(sentryOptions(dsn));
}

export const onRequestError = Sentry.captureRequestError;
