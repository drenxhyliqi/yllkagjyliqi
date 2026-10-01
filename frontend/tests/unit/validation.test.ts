import { describe, expect, it } from "vitest";

import { validateDetails } from "@/lib/booking/validation";

const good = { name: "Ana Krasniqi", phone: "+383 44 123 456", email: "ana@example.com", note: "", address: "" };

describe("booking contact details", () => {
  it("accepts good details", () => {
    expect(validateDetails(good)).toEqual({});
  });

  it("flags each problem by field", () => {
    expect(validateDetails({ ...good, name: "A", phone: "call me", email: "nope" })).toEqual({
      name: "name",
      phone: "phone",
      email: "email",
    });
  });

  it("needs an address only for visits at the client's place", () => {
    expect(validateDetails(good, false)).toEqual({});
    expect(validateDetails(good, true)).toEqual({ address: "address" });
    expect(validateDetails({ ...good, address: "Rruga B 5, Prishtinë" }, true)).toEqual({});
  });
});
