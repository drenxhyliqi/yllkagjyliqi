/*
 * Links that open the phone's own apps with a message ready to send. Nothing
 * is sent automatically: Yllka sees the message and presses send herself.
 */

/** International digits for WhatsApp: "044 123 456" → "38344123456" (Kosovo). */
export function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `383${digits.slice(1)}`;
  return digits;
}

export function callLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappLink(phone: string, message?: string): string {
  const base = `https://wa.me/${whatsappNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function smsLink(phone: string, message?: string): string {
  const number = phone.replace(/[^\d+]/g, "");
  // "?&body=" works on both iOS and Android.
  return message ? `sms:${number}?&body=${encodeURIComponent(message)}` : `sms:${number}`;
}

export function emailLink(email: string, subject: string, message?: string): string {
  const params = new URLSearchParams({ subject, ...(message && { body: message }) });
  return `mailto:${email}?${params.toString().replace(/\+/g, "%20")}`;
}
