"use client";

import type { ReactNode } from "react";

import { useOpeningClock } from "@/components/grand-opening/use-opening-clock";
import { openingPhase, type OpeningPhase } from "@/lib/grand-opening";

/** Shows its content until the opening-week offer is over, then nothing. */
export function WhileOpening({ initialPhase, children }: { initialPhase: OpeningPhase; children: ReactNode }) {
  const now = useOpeningClock();
  const phase = now === null ? initialPhase : openingPhase(now);
  return phase === "over" ? null : children;
}
