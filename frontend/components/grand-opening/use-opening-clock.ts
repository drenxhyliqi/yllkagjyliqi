"use client";

import { useSyncExternalStore } from "react";

/*
 * The current time, ticking every second, read the same way by every piece
 * of the grand opening. The server renders without a clock (null), so the
 * page never hydrates with a stale number.
 */

const listeners = new Set<() => void>();
let timer: number | undefined;
let now = 0;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (timer === undefined) {
    now = Date.now();
    timer = window.setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, 1000);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

const getSnapshot = () => now || Date.now();
const getServerSnapshot = () => null;

export function useOpeningClock(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
