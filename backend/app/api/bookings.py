import uuid
from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Query, Request, status
from fastapi.responses import JSONResponse

from app.api.deps import CurrentAdmin, DbSession
from app.core.config import get_settings
from app.schemas.booking import (
    AdminBookingCreate,
    Availability,
    BookingOut,
    BookingReceipt,
    BookingRequest,
    BookingSummary,
    ClientReschedule,
    ItemIn,
    ManagedBooking,
    NoteUpdate,
    ReminderUpdate,
    Reschedule,
    StatusChange,
    UnavailableTime,
)
from app.services import booking_service, notification_service
from app.services.notification_service import Event
from app.services.availability_service import to_local
from app.services.booking_service import TooManyPending, View
from app.services.rate_limit import TooManyRequests

public_router = APIRouter(tags=["booking"])
admin_router = APIRouter(prefix="/admin/bookings", tags=["admin: bookings"])

ClientIp = Annotated[str | None, Header(alias="X-Client-IP")]


def _client(request: Request, header: str | None) -> str:
    # Set by the website's server, which sees the visitor's address.
    return header or (request.client.host if request.client else "unknown")


def _notify(tasks: BackgroundTasks, db, booking_id: uuid.UUID, event: Event) -> None:
    """Emails are written now (while the data is at hand) and sent after the response."""
    tasks.add_task(notification_service.send_all, notification_service.booking_emails(db, booking_id, event))


def _too_many(code: str, message: str) -> JSONResponse:
    # `code` tells the website which limit was reached.
    return JSONResponse({"message": message, "code": code}, status_code=429)


def _availability(result) -> Availability:
    first, last, free, unavailable = result
    return Availability(
        timezone=get_settings().business_timezone,
        first_day=first,
        last_day=last,
        days=free,
        unavailable={
            day: [UnavailableTime(time=time, reason=reason) for time, reason in times]
            for day, times in unavailable.items()
        },
    )


def _parse_items(raw: str) -> list[ItemIn]:
    """"<service id>:<people>,<service id>:<people>" → items."""
    try:
        items = []
        for part in raw.split(","):
            service_id, _, quantity = part.partition(":")
            items.append(ItemIn(service_id=uuid.UUID(service_id), quantity=int(quantity or 1)))
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown services.") from exc
    if not 1 <= len(items) <= 6 or len({i.service_id for i in items}) != len(items):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Choose one to six services.")
    return items


@public_router.get("/availability")
def availability(
    db: DbSession, items: str, location: Annotated[str, Query(pattern="^(studio|client)$")] = "studio"
) -> Availability:
    """Every start time across the booking window for these services, free or not."""
    return _availability(booking_service.availability_for(db, _parse_items(items), location))


# Limits reached come back as a 429 JSONResponse, outside the receipt model.
@public_router.post(
    "/bookings", status_code=status.HTTP_201_CREATED, response_model=BookingReceipt
)
def request_booking(
    data: BookingRequest,
    request: Request,
    db: DbSession,
    tasks: BackgroundTasks,
    x_client_ip: ClientIp = None,
) -> BookingReceipt | JSONResponse:
    try:
        booking = booking_service.request_booking(db, data, _client(request, x_client_ip))
    except TooManyPending:
        return _too_many(
            "pending_limit", "This number already has several requests waiting for an answer."
        )
    except TooManyRequests:
        return _too_many("rate_limited", "Too many booking requests. Please try again later.")
    _notify(tasks, db, booking.id, "requested")
    start = to_local(booking.start_time)
    return BookingReceipt(
        reference=booking.reference,
        status=booking.status,
        date=start.date(),
        start=start.strftime("%H:%M"),
        manage_token=booking.manage_token,
    )


# ——— The client's private link ———


@public_router.get("/bookings/manage/{token}")
def managed_booking(token: str, db: DbSession) -> ManagedBooking:
    return booking_service.managed(db, token)


@public_router.get("/bookings/manage/{token}/availability")
def managed_availability(token: str, db: DbSession) -> Availability:
    return _availability(booking_service.client_availability(db, token))


@public_router.post("/bookings/manage/{token}/cancel", response_model=ManagedBooking)
def client_cancel(
    token: str, request: Request, db: DbSession, tasks: BackgroundTasks, x_client_ip: ClientIp = None
) -> ManagedBooking | JSONResponse:
    try:
        result = booking_service.client_cancel(db, token, _client(request, x_client_ip))
    except TooManyRequests:
        return _too_many("rate_limited", "Too many changes. Please try again later.")
    _notify(tasks, db, booking_service.id_for_token(db, token), "cancelled_by_client")
    return result


@public_router.post("/bookings/manage/{token}/reschedule", response_model=ManagedBooking)
def client_reschedule(
    token: str,
    data: ClientReschedule,
    request: Request,
    db: DbSession,
    tasks: BackgroundTasks,
    x_client_ip: ClientIp = None,
) -> ManagedBooking | JSONResponse:
    try:
        result = booking_service.client_reschedule(db, token, data, _client(request, x_client_ip))
    except TooManyRequests:
        return _too_many("rate_limited", "Too many changes. Please try again later.")
    _notify(tasks, db, booking_service.id_for_token(db, token), "changed_by_client")
    return result


# ——— Admin ———


@admin_router.get("")
def list_bookings(_: CurrentAdmin, db: DbSession, view: View = "upcoming") -> list[BookingOut]:
    return booking_service.list_view(db, view)


@admin_router.get("/summary")
def summary(_: CurrentAdmin, db: DbSession) -> BookingSummary:
    return booking_service.summary(db)


@admin_router.get("/calendar")
def calendar(
    _: CurrentAdmin,
    db: DbSession,
    first_day: Annotated[date, Query(alias="from")],
    last_day: Annotated[date, Query(alias="to")],
) -> list[BookingOut]:
    if last_day < first_day or last_day - first_day > timedelta(days=62):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Choose up to two months.")
    return booking_service.in_range(db, first_day, last_day)


@admin_router.post("", status_code=status.HTTP_201_CREATED)
def create(
    data: AdminBookingCreate, _: CurrentAdmin, db: DbSession, tasks: BackgroundTasks
) -> BookingOut:
    booking = booking_service.admin_create(db, data)
    # Booked by Yllka herself, so it is confirmed straight away.
    _notify(tasks, db, booking.id, "confirmed")
    return booking


@admin_router.get("/{booking_id}")
def get_booking(booking_id: uuid.UUID, _: CurrentAdmin, db: DbSession) -> BookingOut:
    return booking_service.get(db, booking_id)


STATUS_EMAILS: dict[str, Event] = {
    "confirmed": "confirmed",
    "declined": "declined",
    "cancelled": "cancelled_by_admin",
}


@admin_router.post("/{booking_id}/status")
def change_status(
    booking_id: uuid.UUID,
    change: StatusChange,
    _: CurrentAdmin,
    db: DbSession,
    tasks: BackgroundTasks,
) -> BookingOut:
    before = booking_service.get(db, booking_id).status
    booking = booking_service.change_status(db, booking_id, change)
    # Undoing "completed" back to "confirmed" isn't news for the client.
    if change.status in STATUS_EMAILS and before in ("pending", "confirmed"):
        _notify(tasks, db, booking_id, STATUS_EMAILS[change.status])
    return booking


@admin_router.post("/{booking_id}/reschedule")
def reschedule(
    booking_id: uuid.UUID,
    data: Reschedule,
    _: CurrentAdmin,
    db: DbSession,
    tasks: BackgroundTasks,
) -> BookingOut:
    booking = booking_service.reschedule(db, booking_id, data)
    _notify(tasks, db, booking_id, "rescheduled_by_admin")
    return booking


@admin_router.put("/{booking_id}/note")
def update_note(
    booking_id: uuid.UUID, data: NoteUpdate, _: CurrentAdmin, db: DbSession
) -> BookingOut:
    return booking_service.update_note(db, booking_id, data.admin_note)


@admin_router.put("/{booking_id}/reminder")
def set_reminder(
    booking_id: uuid.UUID, data: ReminderUpdate, _: CurrentAdmin, db: DbSession
) -> BookingOut:
    return booking_service.set_reminder(db, booking_id, data.sent)
