import { describe, expect, it } from "vitest";

import { formatEuros } from "@/lib/format";
import { daysInRange, formatDateRange } from "@/lib/dates";
import { durationLabel, priceLabel } from "@/lib/admin/format";

describe("money and time", () => {
  it("writes euros the Albanian and English way", () => {
    expect(formatEuros(25, "sq")).toBe("25 €");
    expect(formatEuros(12.5, "sq")).toBe("12,50 €");
    expect(formatEuros(12.5, "en")).toBe("€12.50");
  });

  it("labels durations and prices in the admin", () => {
    expect(durationLabel(45)).toBe("45 min");
    expect(durationLabel(90)).toBe("1 orë 30 min");
    expect(priceLabel({ price: 80, price_type: "from" })).toBe("nga 80 €");
    expect(priceLabel({ price: null, price_type: "on_request" })).toBe("Me marrëveshje");
  });

  it("writes date ranges without repeating what is shared", () => {
    expect(formatDateRange("2026-10-12", "2026-10-12", "sq")).toBe("12 tetor 2026");
    expect(formatDateRange("2026-10-12", "2026-10-15", "sq")).toBe("12–15 tetor 2026");
    expect(formatDateRange("2026-10-28", "2026-11-02", "sq")).toBe("28 tetor – 2 nëntor 2026");
    expect(daysInRange("2026-10-28", "2026-11-02")).toBe(6);
  });
});
