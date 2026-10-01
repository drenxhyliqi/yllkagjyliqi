"""
Branded emails in the client's language (Albanian or English). Admin emails
are in Albanian. Every value from a person is escaped before it goes in HTML.
"""

from dataclasses import dataclass
from datetime import date
from html import escape

MONTHS = {
    "sq": ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
    "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
}
WEEKDAYS = {
    "sq": ["e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë", "e diel"],
    "en": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
}


def long_date(day: date, locale: str) -> str:
    """"e shtunë, 3 tetor 2026" / "Saturday, 3 October 2026"."""
    return f"{WEEKDAYS[locale][day.weekday()]}, {day.day} {MONTHS[locale][day.month - 1]} {day.year}"


@dataclass(frozen=True)
class Email:
    to: str
    subject: str
    html: str
    text: str
    reply_to: str | None = None


@dataclass(frozen=True)
class Content:
    heading: str
    paragraphs: list[str]
    # Label → value rows, e.g. "Date" → "Saturday, 3 October 2026".
    details: list[tuple[str, str]]
    button: tuple[str, str] | None = None
    # A message written by Yllka, shown as a quote.
    quote: str | None = None
    footer: str | None = None


def render(business: str, content: Content) -> tuple[str, str]:
    """HTML and plain-text versions of an email."""
    rows = "".join(
        f'<tr><td style="padding:8px 0;border-bottom:1px solid #e7dfd3;color:#5f574e;font-size:13px;'
        f'letter-spacing:.08em;text-transform:uppercase;width:38%;vertical-align:top">{escape(label)}</td>'
        f'<td style="padding:8px 0;border-bottom:1px solid #e7dfd3;font-size:15px">{escape(value)}</td></tr>'
        for label, value in content.details
    )
    paragraphs = "".join(f'<p style="margin:0 0 14px">{escape(p)}</p>' for p in content.paragraphs)
    quote = (
        f'<p style="margin:20px 0;padding:0 0 0 14px;border-left:2px solid #111;white-space:pre-line">{escape(content.quote)}</p>'
        if content.quote
        else ""
    )
    button = (
        f'<p style="margin:28px 0 8px"><a href="{escape(content.button[1])}" style="display:inline-block;background:#111;'
        f'color:#faf7f2;text-decoration:none;padding:14px 24px;font-size:12px;letter-spacing:.18em;text-transform:uppercase">'
        f"{escape(content.button[0])}</a></p>"
        if content.button
        else ""
    )
    footer = f'<p style="margin:32px 0 0;color:#5f574e;font-size:12px">{escape(content.footer)}</p>' if content.footer else ""
    html = f"""<!doctype html>
<html><body style="margin:0;background:#faf7f2;color:#111">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2"><tr><td align="center" style="padding:36px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6">
<tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-style:italic;padding-bottom:28px">{escape(business)}</td></tr>
<tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.3;padding-bottom:16px">{escape(content.heading)}</td></tr>
<tr><td>{paragraphs}{quote}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid #e7dfd3">{rows}</table>{button}{footer}</td></tr>
</table></td></tr></table></body></html>"""

    lines = [content.heading, "", *content.paragraphs]
    if content.quote:
        lines += ["", content.quote]
    lines += ["", *(f"{label}: {value}" for label, value in content.details)]
    if content.button:
        lines += ["", f"{content.button[0]}: {content.button[1]}"]
    if content.footer:
        lines += ["", content.footer]
    return html, "\n".join(lines)


# ——— Words, per language ———

CLIENT = {
    "sq": {
        "services": "Shërbimet",
        "date": "Data",
        "time": "Ora",
        "place": "Vendi",
        "studio": "Në studio",
        "reference": "Numri",
        "manage": "Shiko ose ndrysho rezervimin",
        "deadline": "Mund ta anuloni ose ndryshoni online deri në {hours} orë para terminit.",
        "contact": "Pyetje? Telefononi ose shkruani: {phone}",
        "received_subject": "Kërkesa juaj u pranua – {date}, {time}",
        "received_heading": "Faleminderit, {name}!",
        "received_text": "Kërkesa juaj për termin u pranua. Do ta konfirmoj së shpejti.",
        "confirmed_subject": "Termini juaj u konfirmua – {date}, {time}",
        "confirmed_heading": "Termini juaj u konfirmua",
        "confirmed_text": "Ju presim!",
        "declined_subject": "Kërkesa juaj për termin",
        "declined_heading": "Kërkesa nuk mund të pranohej",
        "declined_text": "Fatkeqësisht nuk mund t’ju pres në këtë orë. Jeni të mirëpritur të zgjidhni një orë tjetër.",
        "book_again": "Zgjidhni një orë tjetër",
        "cancelled_subject": "Termini juaj u anulua – {date}",
        "cancelled_heading": "Termini juaj u anulua",
        "cancelled_text": "Ky termin u anulua. Për një orë të re, mund të rezervoni sërish ose të më shkruani.",
        "moved_subject": "Termini juaj u zhvendos – {date}, {time}",
        "moved_heading": "Termini juaj u zhvendos",
        "moved_text": "Ora e re e terminit tuaj:",
        "you_moved_subject": "Kërkesa për orën e re u pranua – {date}, {time}",
        "you_moved_heading": "Kërkesa për orën e re u pranua",
        "you_moved_text": "Do ta konfirmoj orën e re së shpejti.",
        "you_cancelled_subject": "Termini u anulua – {date}",
        "you_cancelled_heading": "Termini juaj u anulua",
        "you_cancelled_text": "E anuluat terminin. Shpresoj t’ju shoh një herë tjetër.",
    },
    "en": {
        "services": "Services",
        "date": "Date",
        "time": "Time",
        "place": "Where",
        "studio": "At the studio",
        "reference": "Reference",
        "manage": "View or change your booking",
        "deadline": "You can cancel or change online until {hours} hours before the appointment.",
        "contact": "Questions? Call or message: {phone}",
        "received_subject": "Your request was received – {date}, {time}",
        "received_heading": "Thank you, {name}!",
        "received_text": "Your appointment request has been received. I will confirm it soon.",
        "confirmed_subject": "Your appointment is confirmed – {date}, {time}",
        "confirmed_heading": "Your appointment is confirmed",
        "confirmed_text": "See you then!",
        "declined_subject": "Your appointment request",
        "declined_heading": "The request could not be accepted",
        "declined_text": "Unfortunately I can’t take this time. You are welcome to choose another.",
        "book_again": "Choose another time",
        "cancelled_subject": "Your appointment is cancelled – {date}",
        "cancelled_heading": "Your appointment is cancelled",
        "cancelled_text": "This appointment has been cancelled. For a new time, book again or message me.",
        "moved_subject": "Your appointment has moved – {date}, {time}",
        "moved_heading": "Your appointment has moved",
        "moved_text": "The new time of your appointment:",
        "you_moved_subject": "Your new time was requested – {date}, {time}",
        "you_moved_heading": "Your new time was requested",
        "you_moved_text": "I will confirm the new time soon.",
        "you_cancelled_subject": "Appointment cancelled – {date}",
        "you_cancelled_heading": "Your appointment is cancelled",
        "you_cancelled_text": "You cancelled your appointment. I hope to see you another time.",
    },
}
