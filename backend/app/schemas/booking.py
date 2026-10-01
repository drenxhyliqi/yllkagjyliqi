import re
import uuid
from datetime import date, datetime, time
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, model_validator

from app.schemas.common import Euros, OptionalText, Text
from app.schemas.service import PriceType

BookingStatus = Literal[
    "pending", "confirmed", "declined", "cancelled", "completed", "no_show", "expired"
]
Location = Literal["studio", "client"]

_PHONE = re.compile(r"^\+?[\d\s().-]+$")
_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


def _phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if not _PHONE.match(value) or not 6 <= len(digits) <= 15:
        raise ValueError("Please enter a valid phone number.")
    return value


def _email(value: str | None) -> str | None:
    if value is not None and not _EMAIL.match(value):
        raise ValueError("Please enter a valid email address.")
    return value


Phone = Annotated[Text(40), AfterValidator(_phone)]
Email = Annotated[OptionalText(254), AfterValidator(_email)]


class ItemIn(BaseModel):
    service_id: uuid.UUID
    # Number of people, e.g. the bride and her bridesmaids.
    quantity: Annotated[int, Field(ge=1, le=10)] = 1


Items = Annotated[list[ItemIn], Field(min_length=1, max_length=6)]


def _check_items(items: list[ItemIn]) -> list[ItemIn]:
    if len({item.service_id for item in items}) != len(items):
        raise ValueError("Each service can be chosen once; set the number of people instead.")
    return items


def _check_place(location: str, address: str | None) -> None:
    if location == "client" and not address:
        raise ValueError("Please enter the address for the appointment.")


class BookingRequest(BaseModel):
    """A customer's request from the website."""

    items: Items
    location: Location = "studio"
    address: OptionalText(300) = None
    date: date
    time: time
    customer_name: Annotated[Text(120), Field(min_length=2)]
    customer_phone: Phone
    customer_email: Email = None
    customer_note: OptionalText(1000) = None
    locale: Literal["sq", "en"] = "sq"

    @model_validator(mode="after")
    def check(self) -> "BookingRequest":
        _check_items(self.items)
        _check_place(self.location, self.address)
        if self.location == "studio":
            self.address = None
        return self


class AdminBookingCreate(BaseModel):
    """An appointment Yllka adds herself, e.g. one arranged by phone."""

    items: Items
    location: Location = "studio"
    address: OptionalText(300) = None
    date: date
    time: time
    # Defaults to the services' total.
    duration_minutes: Annotated[int, Field(ge=5, le=720)] | None = None
    customer_name: Text(120)
    customer_phone: Phone
    customer_email: Email = None
    customer_note: OptionalText(1000) = None
    locale: Literal["sq", "en"] = "sq"

    @model_validator(mode="after")
    def check(self) -> "AdminBookingCreate":
        _check_items(self.items)
        _check_place(self.location, self.address)
        return self


class StatusChange(BaseModel):
    status: BookingStatus
    # Message to the customer about the decision.
    message: OptionalText(1000) = None


class Reschedule(BaseModel):
    date: date
    time: time
    duration_minutes: Annotated[int, Field(ge=5, le=720)] | None = None
    message: OptionalText(1000) = None


class NoteUpdate(BaseModel):
    admin_note: OptionalText(2000) = None


class ItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    service_id: uuid.UUID | None
    name_sq: str
    name_en: str | None
    duration_minutes: int
    price: Euros | None
    price_type: PriceType
    quantity: int


class ConflictRef(BaseModel):
    """Another booking at an overlapping time."""

    id: uuid.UUID
    reference: str
    status: BookingStatus
    customer_name: str
    service_name: str
    start: str
    end: str


class BookingOut(BaseModel):
    id: uuid.UUID
    reference: str
    status: BookingStatus
    source: Literal["website", "admin"]
    service_id: uuid.UUID | None
    service_name: str
    service_name_en: str | None
    price: Euros | None
    price_type: PriceType
    start_time: datetime
    end_time: datetime
    # Local business time, so screens don't have to convert.
    date: date
    start: str
    end: str
    duration_minutes: int
    customer_name: str
    customer_phone: str
    customer_email: str | None
    customer_note: str | None
    locale: Literal["sq", "en"]
    admin_message: str | None
    admin_note: str | None
    created_at: datetime
    decided_at: datetime | None
    items: list[ItemOut]
    location: Location
    address: str | None
    # Travel and preparation time around the appointment ("HH:MM").
    block_start: str
    block_end: str
    manage_token: str
    cancelled_by: Literal["client", "admin"] | None
    client_changed_at: datetime | None
    reminder_sent_at: datetime | None
    # Other pending or confirmed bookings overlapping this one (only for
    # bookings that are themselves pending or confirmed).
    conflicts: list[ConflictRef] = []


class BookingReceipt(BaseModel):
    """What the website shows after a request: no personal details echoed back."""

    reference: str
    status: BookingStatus
    date: date
    start: str
    # For the client's "manage my booking" link.
    manage_token: str


class ManagedBooking(BaseModel):
    """What a client sees through their private link."""

    reference: str
    status: BookingStatus
    date: date
    start: str
    end: str
    items: list[ItemOut]
    location: Location
    address: str | None
    customer_name: str
    locale: Literal["sq", "en"]
    # Whether they can still cancel or change online, and until when.
    can_change: bool
    change_deadline: datetime
    policy: str | None
    business_name: str
    business_phone: str | None


class ClientReschedule(BaseModel):
    date: date
    time: time


class ReminderUpdate(BaseModel):
    sent: bool


class BookingSummary(BaseModel):
    pending: int
    today: int
    upcoming: int
    # Upcoming bookings that overlap another one and need a decision.
    conflicts: int
    # Confirmed appointments tomorrow still waiting for a reminder.
    reminders: int


class UnavailableTime(BaseModel):
    time: str
    # booked: a confirmed appointment · break: Yllka's daily break ·
    # notice: already past, or too soon to book.
    reason: Literal["booked", "break", "notice"]


class Availability(BaseModel):
    """Start times per day ("HH:MM", business time) for one service."""

    timezone: str
    first_day: date
    last_day: date
    # Times that can be booked.
    days: dict[date, list[str]]
    # Every other start time of open days, greyed out on the website so the
    # whole day stays visible. Never bookable.
    unavailable: dict[date, list[UnavailableTime]]
