/*
 * Error monitoring in the browser. Off unless NEXT_PUBLIC_SENTRY_DSN is set,
 * and only then is the Sentry code downloaded: visitors don't pay for it
 * while it's off. No replays, no personal data.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

type Sentry = typeof import("@sentry/nextjs");
let sentry: Sentry | undefined;

if (dsn) {
  void Promise.all([import("@sentry/nextjs"), import("@/lib/sentry-options")]).then(
    ([module, { sentryOptions }]) => {
      module.init(sentryOptions(dsn));
      sentry = module;
    },
  );
}

export function onRouterTransitionStart(...args: Parameters<Sentry["captureRouterTransitionStart"]>) {
  sentry?.captureRouterTransitionStart(...args);
}
