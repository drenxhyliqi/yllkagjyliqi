/** Session-storage key recording that the intro loader has played this session. */
export const INTRO_STORAGE_KEY = "yllka-intro";

export type IntroState = "play" | "seen";

/**
 * Decides whether the intro loader plays, and records that it has. It plays
 * once per visit, on the homepage only: someone opening the booking page from
 * an Instagram link sees the page straight away.
 * Kept in sync with the inline boot script in the locale layout, which does
 * the same before first paint on server-rendered pages.
 */
export function decideIntro(): IntroState {
  if (!/^\/(sq|en)\/?$/.test(window.location.pathname)) return "seen";
  try {
    if (sessionStorage.getItem(INTRO_STORAGE_KEY)) return "seen";
    sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    // Storage unavailable (private mode, blocked): just play the intro.
  }
  return "play";
}
