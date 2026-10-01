import { describe, expect, it } from "vitest";

import { en } from "@/i18n/dictionaries/en";
import { sq } from "@/i18n/dictionaries/sq";
import { itemLabel, itemsParam, resolveChosen, totalMinutes, totalPrice } from "@/lib/booking/selection";
import type { Service } from "@/types/service";

const service = (slug: string, price: number | null, priceType: Service["priceType"], minutes: number): Service => ({
  id: `id-${slug}`,
  slug,
  name: slug,
  description: null,
  price,
  priceType,
  durationMinutes: minutes,
});

const makeup = service("makeup", 80, "from", 90);
const hair = service("hair", 70, "fixed", 90);
const group = service("group", null, "on_request", 60);
const all = [makeup, hair, group];

describe("chosen services", () => {
  it("adds up time for every person, one after another", () => {
    const items = resolveChosen([{ slug: "makeup", quantity: 1 }, { slug: "hair", quantity: 3 }], all);
    expect(totalMinutes(items)).toBe(360);
    expect(items.map(itemLabel)).toEqual(["makeup", "hair × 3"]);
    expect(itemsParam(items)).toBe("id-makeup:1,id-hair:3");
  });

  it("shows 'from' when any price can grow, and euros the local way", () => {
    const items = resolveChosen([{ slug: "makeup", quantity: 1 }, { slug: "hair", quantity: 3 }], all);
    expect(totalPrice(items, "sq", sq.pricing)).toBe("nga 290 €");
    expect(totalPrice(items, "en", en.pricing)).toBe("from €290");
  });

  it("treats a price on request as open", () => {
    const fixed = resolveChosen([{ slug: "hair", quantity: 1 }], all);
    expect(totalPrice(fixed, "sq", sq.pricing)).toBe("70 €");
    const mixed = resolveChosen([{ slug: "hair", quantity: 1 }, { slug: "group", quantity: 1 }], all);
    expect(totalPrice(mixed, "sq", sq.pricing)).toBe("nga 70 €");
    const onlyRequest = resolveChosen([{ slug: "group", quantity: 1 }], all);
    expect(totalPrice(onlyRequest, "sq", sq.pricing)).toBe(sq.pricing.onRequest);
  });

  it("ignores services that no longer exist", () => {
    expect(resolveChosen([{ slug: "gone", quantity: 1 }], all)).toEqual([]);
  });
});
