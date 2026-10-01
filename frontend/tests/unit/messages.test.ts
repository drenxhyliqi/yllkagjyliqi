import { describe, expect, it } from "vitest";

import { messageFor } from "@/lib/admin/booking-text";
import { callLink, smsLink, whatsappLink, whatsappNumber } from "@/lib/admin/contact-links";

const booking = {
  customer_name: "Ana Krasniqi",
  service_name: "Make-up nuseje",
  service_name_en: "Bridal makeup",
  locale: "sq" as const,
};

describe("messages to clients", () => {
  it("writes in the client's language, with their first name", () => {
    const sq = messageFor("confirmed", booking, "2026-10-03", "10:00", "Yllka");
    expect(sq).toContain("Përshëndetje Ana");
    expect(sq).toContain("Make-up nuseje");
    expect(sq).toContain("3 tetor 2026");
    const en = messageFor("confirmed", { ...booking, locale: "en" }, "2026-10-03", "10:00", "Yllka");
    expect(en).toContain("Bridal makeup");
  });

  it("adds the manage link only where it helps", () => {
    const link = "https://yllka.example/sq/booking/abc";
    expect(messageFor("confirmed", booking, "2026-10-03", "10:00", "Yllka", link)).toContain(link);
    expect(messageFor("declined", booking, "2026-10-03", "10:00", "Yllka", link)).not.toContain(link);
  });
});

describe("contact links", () => {
  it("turns Kosovo numbers into WhatsApp's international form", () => {
    expect(whatsappNumber("044 123 456")).toBe("38344123456");
    expect(whatsappNumber("+383 44 123 456")).toBe("38344123456");
    expect(whatsappNumber("0038344123456")).toBe("38344123456");
  });

  it("prefills messages safely", () => {
    expect(whatsappLink("044 123 456", "Hi & bye")).toBe("https://wa.me/38344123456?text=Hi%20%26%20bye");
    expect(smsLink("044 123 456", "Hi")).toBe("sms:044123456?&body=Hi");
    expect(callLink("+383 (44) 123-456")).toBe("tel:+38344123456");
  });
});
