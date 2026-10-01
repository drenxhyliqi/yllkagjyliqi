import { describe, expect, it } from "vitest";

import { openingPhase, timeUntilOpening } from "@/lib/grand-opening";

// Kosovo time is UTC+2 in October (summer time until the 25th).
const at = (isoLocal: string) => Date.parse(`${isoLocal}+02:00`);

describe("grand opening", () => {
  it("counts down until Sunday 4 October, 12:00 Kosovo time", () => {
    expect(openingPhase(at("2026-10-01T20:18:28"))).toBe("countdown");
    expect(timeUntilOpening(at("2026-10-01T20:18:28"))).toEqual({ days: 2, hours: 15, minutes: 41, seconds: 32 });
    expect(timeUntilOpening(at("2026-10-04T11:59:59"))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1 });
  });

  it("shows the offer for the opening week, through 10 October", () => {
    expect(openingPhase(at("2026-10-04T12:00:00"))).toBe("offer");
    expect(openingPhase(at("2026-10-10T23:59:59"))).toBe("offer");
  });

  it("goes away when the offer is over, and never counts below zero", () => {
    expect(openingPhase(at("2026-10-11T00:00:00"))).toBe("over");
    expect(timeUntilOpening(at("2026-10-12T00:00:00"))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});
