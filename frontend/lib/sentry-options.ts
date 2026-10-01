import type { ErrorEvent } from "@sentry/nextjs";

/** The client's private booking link works like a password: never send it. */
const PRIVATE_LINK = /(\/booking\/|\/manage\/)[A-Za-z0-9_-]{16,}/g;
const scrub = (value?: string) => value?.replace(PRIVATE_LINK, "$1[hidden]");

/**
 * Errors only, with no personal data: no user details, cookies, headers,
 * query strings or request/response bodies (booking forms hold names and
 * phone numbers).
 */
export function sentryOptions(dsn: string) {
  return {
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0,
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
    beforeSend(event: ErrorEvent) {
      if (event.request?.url) event.request.url = scrub(event.request.url);
      if (event.transaction) event.transaction = scrub(event.transaction);
      for (const crumb of event.breadcrumbs ?? []) {
        if (crumb.data?.url) crumb.data.url = scrub(String(crumb.data.url));
        if (crumb.data?.to) crumb.data.to = scrub(String(crumb.data.to));
        if (crumb.data?.from) crumb.data.from = scrub(String(crumb.data.from));
      }
      return event;
    },
  };
}
