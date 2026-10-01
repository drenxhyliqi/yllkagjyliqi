"""
Booking emails, sent through Resend (resend.com).

Without RESEND_API_KEY nothing is sent: each email is written to the log
instead, so development works without an account. Sending happens after the
response (in the background), and a failed email never fails a booking.
"""

import logging
import uuid
from typing import Literal

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Admin, Booking
from app.services import schedule_service, settings_service
from app.services.availability_service import to_local
from app.services.email_templates import CLIENT, Content, Email, long_date, render

logger = logging.getLogger(__name__)

RESEND_API = "https://api.resend.com/emails"

Event = Literal[
    "requested",
    "confirmed",
    "declined",
    "cancelled_by_admin",
    "rescheduled_by_admin",
    "cancelled_by_client",
    "changed_by_client",
]


def emails_enabled() -> bool:
    settings = get_settings()
    return bool(settings.resend_api_key and settings.email_from)


def send(email: Email) -> None:
    settings = get_settings()
    if not emails_enabled():
        logger.info("Email not sent (no RESEND_API_KEY): to=%s subject=%r\n%s", email.to, email.subject, email.text)
        return
    payload = {
        "from": settings.email_from,
        "to": [email.to],
        "subject": email.subject,
        "html": email.html,
        "text": email.text,
    }
    if email.reply_to:
        payload["reply_to"] = email.reply_to
    try:
        response = httpx.post(
            RESEND_API,
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json=payload,
            timeout=15,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        # Logged as an error, so error monitoring sees it; the booking itself is saved.
        logger.error("Email to %s failed (%r): %s", email.to, email.subject, exc)


def send_all(emails: list[Email]) -> None:
    for email in emails:
        send(email)


# ——— Booking emails ———


def _admin_addresses(db: Session) -> list[str]:
    configured = get_settings().notify_email
    if configured:
        return [address.strip() for address in configured.split(",") if address.strip()]
    return list(db.scalars(select(Admin.email).where(Admin.is_active)))


def _item_names(booking: Booking, locale: str) -> str:
    def name(item) -> str:
        label = item.name_en if locale == "en" and item.name_en else item.name_sq
        return f"{label} × {item.quantity}" if item.quantity > 1 else label

    return ", ".join(name(item) for item in booking.items)


def _when(booking: Booking, locale: str) -> tuple[str, str]:
    start, end = to_local(booking.start_time), to_local(booking.end_time)
    return long_date(start.date(), locale), f"{start:%H:%M}–{end:%H:%M}"


def _client_email(db: Session, booking: Booking, event: Event) -> Email | None:
    if not booking.customer_email:
        return None
    site = get_settings().site_url.rstrip("/")
    business = settings_service.get(db)
    words = CLIENT[booking.locale]
    day, hours = _when(booking, booking.locale)
    start = hours.split("–")[0]
    manage = (words["manage"], f"{site}/{booking.locale}/booking/{booking.manage_token}")
    book_again = (words["book_again"], f"{site}/{booking.locale}/book")
    first_name = booking.customer_name.split()[0]

    details = [
        (words["services"], _item_names(booking, booking.locale)),
        (words["date"], day),
        (words["time"], hours),
        (words["place"], booking.address if booking.location == "client" and booking.address else words["studio"]),
        (words["reference"], booking.reference),
    ]
    hours_notice = schedule_service.get_booking_settings(db).cancellation_notice_hours
    deadline = words["deadline"].format(hours=hours_notice) if hours_notice else None
    contact = words["contact"].format(phone=business.phone) if business.phone else None

    key, paragraphs, button, quote = {
        "requested": ("received", [deadline], manage, None),
        "confirmed": ("confirmed", [deadline], manage, booking.admin_message),
        "declined": ("declined", [], book_again, booking.admin_message),
        "cancelled_by_admin": ("cancelled", [], book_again, booking.admin_message),
        "rescheduled_by_admin": ("moved", [], manage, booking.admin_message),
        "changed_by_client": ("you_moved", [], manage, None),
        "cancelled_by_client": ("you_cancelled", [], book_again, None),
    }[event]

    content = Content(
        heading=words[f"{key}_heading"].format(name=first_name),
        paragraphs=[words[f"{key}_text"], *[p for p in paragraphs if p]],
        details=details,
        button=button,
        quote=quote,
        footer=contact,
    )
    html, text = render(business.business_name, content)
    return Email(
        to=booking.customer_email,
        subject=words[f"{key}_subject"].format(date=day, time=start),
        html=html,
        text=text,
        reply_to=business.email,
    )


ADMIN_HEADINGS = {
    "requested": ("Kërkesë e re", "Një klient kërkon një termin. Pranojeni ose refuzojeni në panel."),
    "changed_by_client": ("Klienti ndryshoi orën", "Klienti zgjodhi një orë tjetër. Konfirmojeni sërish në panel."),
    "cancelled_by_client": ("Klienti anuloi terminin", "Ky termin u anulua nga vetë klienti. Ora tani është e lirë."),
}


def _admin_emails(db: Session, booking: Booking, event: Event) -> list[Email]:
    if event not in ADMIN_HEADINGS:
        return []
    site = get_settings().site_url.rstrip("/")
    business = settings_service.get(db)
    heading, text_line = ADMIN_HEADINGS[event]
    day, hours = _when(booking, "sq")
    details = [
        ("Klienti", booking.customer_name),
        ("Telefoni", booking.customer_phone),
        *([("Email", booking.customer_email)] if booking.customer_email else []),
        ("Shërbimet", _item_names(booking, "sq")),
        ("Data", day),
        ("Ora", hours),
        ("Vendi", f"Te klienti: {booking.address}" if booking.location == "client" else "Në studio"),
        *([("Shënimi", booking.customer_note)] if booking.customer_note else []),
    ]
    content = Content(
        heading=heading,
        paragraphs=[text_line],
        details=details,
        button=("Hap në panel", f"{site}/admin/bookings/{booking.id}"),
    )
    html, text = render(business.business_name, content)
    subject = f"{heading}: {booking.customer_name} · {day}, {hours.split('–')[0]}"
    return [
        Email(to=address, subject=subject, html=html, text=text, reply_to=booking.customer_email)
        for address in _admin_addresses(db)
    ]


def booking_emails(db: Session, booking_id: uuid.UUID, event: Event) -> list[Email]:
    """Everything to send for this event: to Yllka and/or to the client."""
    booking = db.get(Booking, booking_id)
    if booking is None:
        return []
    client = _client_email(db, booking, event)
    return _admin_emails(db, booking, event) + ([client] if client else [])
