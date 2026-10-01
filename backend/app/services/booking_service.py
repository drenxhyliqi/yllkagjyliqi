"""Appointment requests and how Yllka handles them."""

import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta
from decimal import Decimal
from typing import Literal

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, InvalidInputError, NotFoundError
from app.models import Booking, BookingItem, Category, Service
from app.models.booking import ACTIVE_STATUSES
from app.schemas.booking import (
    AdminBookingCreate,
    BookingOut,
    BookingRequest,
    BookingSummary,
    ClientReschedule,
    ConflictRef,
    ItemIn,
    ItemOut,
    ManagedBooking,
    Reschedule,
    StatusChange,
)
from app.services import availability_service, schedule_service, settings_service
from app.services.availability_service import local_datetime, to_local
from app.services.rate_limit import TooManyRequests, booking_limit, manage_limit

REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I
# A phone number can have this many unanswered requests waiting at once.
# Confirmed appointments don't count: Yllka has already said yes to those.
MAX_PENDING_PER_PHONE = 3
# Longest booking, all services and people together.
MAX_TOTAL_MINUTES = 12 * 60

# Which status can follow which. Undo is allowed for finished appointments.
TRANSITIONS: dict[str, set[str]] = {
    "pending": {"confirmed", "declined"},
    "confirmed": {"completed", "no_show", "cancelled"},
    "completed": {"confirmed"},
    "no_show": {"confirmed"},
    "declined": {"pending"},
    "cancelled": {"confirmed"},
    "expired": set(),
}

View = Literal["upcoming", "pending", "today", "week", "past", "cancelled", "reminders"]


class TooManyPending(Exception):
    """This phone number already has several requests waiting for an answer."""


# ——— Building a booking ———


@dataclass
class Plan:
    """What is being booked, worked out from the chosen services."""

    items: list[BookingItem]
    minutes: int
    summary_sq: str
    summary_en: str | None
    price: Decimal | None
    price_type: str
    first_service_id: uuid.UUID


def _plan(db: Session, items: list[ItemIn], *, public: bool) -> Plan:
    services = {s.id: s for s in db.scalars(select(Service).where(Service.id.in_([i.service_id for i in items])))}
    if len(services) != len(items):
        raise InvalidInputError("One of the services no longer exists.")
    if public:
        active_categories = set(db.scalars(select(Category.id).where(Category.is_active)))
        for service in services.values():
            if (
                not service.is_active
                or service.category_id not in active_categories
                or service.duration_minutes is None
            ):
                raise InvalidInputError("One of the services can't be booked online.")

    rows: list[BookingItem] = []
    for position, item in enumerate(items):
        service = services[item.service_id]
        rows.append(
            BookingItem(
                service_id=service.id,
                name_sq=service.name_sq,
                name_en=service.name_en,
                duration_minutes=service.duration_minutes or 0,
                price=service.price,
                price_type=service.price_type,
                quantity=item.quantity,
                sort_order=position,
            )
        )

    minutes = sum(row.duration_minutes * row.quantity for row in rows)
    if minutes > MAX_TOTAL_MINUTES:
        raise InvalidInputError("That is more than one day of work. Please contact Yllka directly.")

    def label(name: str, quantity: int) -> str:
        return f"{name} ×{quantity}" if quantity > 1 else name

    priced = [row for row in rows if row.price is not None]
    price = sum((row.price * row.quantity for row in priced), Decimal(0)) if priced else None
    if not priced:
        price_type = "on_request"
    elif len(priced) < len(rows) or any(row.price_type == "from" for row in priced):
        price_type = "from"
    else:
        price_type = "fixed"

    return Plan(
        items=rows,
        minutes=minutes,
        summary_sq=" + ".join(label(row.name_sq, row.quantity) for row in rows)[:300],
        summary_en=" + ".join(label(row.name_en or row.name_sq, row.quantity) for row in rows)[:300],
        price=price,
        price_type=price_type,
        first_service_id=rows[0].service_id,
    )


def _place(db: Session, booking: Booking, day: date, at: time, minutes: int) -> None:
    """Sets the appointment time and the block it takes from Yllka's day."""
    before, after = availability_service.margins(db, booking.location)
    start = local_datetime(day, at)
    booking.start_time = start
    booking.end_time = start + timedelta(minutes=minutes)
    booking.block_start = start - timedelta(minutes=before)
    booking.block_end = booking.end_time + timedelta(minutes=after)


def _minutes(booking: Booking) -> int:
    return int((booking.end_time - booking.start_time).total_seconds() // 60)


def _new_reference(db: Session) -> str:
    while True:
        reference = "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(6))
        if not db.scalar(select(func.count()).where(Booking.reference == reference)):
            return reference


# PostgreSQL error codes for "two transactions wanted the same thing at once".
DEADLOCK, SERIALIZATION_FAILURE = "40P01", "40001"


def _commit_or_conflict(db: Session) -> None:
    """Commits; a clash with another confirmed booking becomes a ConflictError."""
    overlap = ConflictError("This time overlaps a confirmed appointment.")
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        constraint = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)
        if constraint == "ex_bookings_no_overlap":
            raise overlap from exc
        raise
    except OperationalError as exc:
        db.rollback()
        # Two overlapping bookings saved at the same instant: PostgreSQL lets one
        # through and stops the other as a deadlock rather than an overlap.
        if getattr(exc.orig, "sqlstate", None) in (DEADLOCK, SERIALIZATION_FAILURE):
            raise overlap from exc
        raise


def _get(db: Session, booking_id: uuid.UUID) -> Booking:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise NotFoundError("That booking no longer exists.")
    return booking


def expire_stale(db: Session, now: datetime | None = None) -> None:
    """Requests nobody answered before their time are marked expired."""
    db.execute(
        update(Booking)
        .where(Booking.status == "pending", Booking.start_time <= (now or datetime.now(UTC)))
        .values(status="expired")
    )
    db.commit()


# ——— Output ———


def _conflict_map(db: Session, bookings: list[Booking]) -> dict[uuid.UUID, list[Booking]]:
    """For each pending/confirmed booking: the other pending/confirmed ones overlapping it."""
    active = [b for b in bookings if b.status in ACTIVE_STATUSES]
    if not active:
        return {}
    earliest = min(b.block_start for b in active)
    latest = max(b.block_end for b in active)
    nearby = list(
        db.scalars(
            select(Booking)
            .where(
                Booking.status.in_(ACTIVE_STATUSES),
                Booking.block_start < latest,
                Booking.block_end > earliest,
            )
            .order_by(Booking.start_time)
        )
    )
    return {
        b.id: [
            other
            for other in nearby
            if other.id != b.id and other.block_start < b.block_end and other.block_end > b.block_start
        ]
        for b in active
    }


def _hhmm(moment: datetime) -> str:
    return to_local(moment).strftime("%H:%M")


def _ref(booking: Booking) -> ConflictRef:
    return ConflictRef(
        id=booking.id,
        reference=booking.reference,
        status=booking.status,
        customer_name=booking.customer_name,
        service_name=booking.service_name_sq,
        start=_hhmm(booking.start_time),
        end=_hhmm(booking.end_time),
    )


def _out(booking: Booking, conflicts: list[Booking] = ()) -> BookingOut:
    return BookingOut(
        id=booking.id,
        reference=booking.reference,
        status=booking.status,
        source=booking.source,
        service_id=booking.service_id,
        service_name=booking.service_name_sq,
        service_name_en=booking.service_name_en,
        price=booking.price,
        price_type=booking.price_type,
        start_time=booking.start_time,
        end_time=booking.end_time,
        date=to_local(booking.start_time).date(),
        start=_hhmm(booking.start_time),
        end=_hhmm(booking.end_time),
        duration_minutes=_minutes(booking),
        customer_name=booking.customer_name,
        customer_phone=booking.customer_phone,
        customer_email=booking.customer_email,
        customer_note=booking.customer_note,
        locale=booking.locale,
        admin_message=booking.admin_message,
        admin_note=booking.admin_note,
        created_at=booking.created_at,
        decided_at=booking.decided_at,
        items=[ItemOut.model_validate(item) for item in booking.items],
        location=booking.location,
        address=booking.address,
        block_start=_hhmm(booking.block_start),
        block_end=_hhmm(booking.block_end),
        manage_token=booking.manage_token,
        cancelled_by=booking.cancelled_by,
        client_changed_at=booking.client_changed_at,
        reminder_sent_at=booking.reminder_sent_at,
        conflicts=[_ref(other) for other in conflicts],
    )


def _outs(db: Session, bookings: list[Booking]) -> list[BookingOut]:
    conflicts = _conflict_map(db, bookings)
    return [_out(booking, conflicts.get(booking.id, [])) for booking in bookings]


def _one(db: Session, booking: Booking) -> BookingOut:
    return _outs(db, [booking])[0]


# ——— Website ———


def _check_free(
    db: Session,
    minutes: int,
    location: str,
    day: date,
    at: time,
    exclude_booking_id: uuid.UUID | None = None,
) -> None:
    """The final check, on the server: the time must be offered right now."""
    _, _, free, _ = availability_service.public_slots(
        db, minutes, location, exclude_booking_id=exclude_booking_id
    )
    if at.strftime("%H:%M") not in free.get(day, []):
        raise ConflictError("This time is no longer available.")


def _check_location(db: Session, location: str) -> None:
    if location == "client" and not schedule_service.get_booking_settings(db).home_visits:
        raise InvalidInputError("Appointments at your place aren't offered at the moment.")


def request_booking(db: Session, data: BookingRequest, client: str) -> Booking:
    booking_limit.check(db, client)
    plan = _plan(db, data.items, public=True)
    _check_location(db, data.location)
    _check_free(db, plan.minutes, data.location, data.date, data.time)

    waiting = db.scalar(
        select(func.count()).where(
            Booking.customer_phone == data.customer_phone,
            Booking.status == "pending",
            Booking.end_time > datetime.now(UTC),
        )
    )
    if waiting >= MAX_PENDING_PER_PHONE:
        raise TooManyPending

    booking = Booking(
        reference=_new_reference(db),
        manage_token=secrets.token_urlsafe(24),
        status="pending",
        source="website",
        location=data.location,
        address=data.address,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        customer_note=data.customer_note,
        locale=data.locale,
        service_id=plan.first_service_id,
        service_name_sq=plan.summary_sq,
        service_name_en=plan.summary_en,
        price=plan.price,
        price_type=plan.price_type,
        items=plan.items,
    )
    _place(db, booking, data.date, data.time, plan.minutes)
    db.add(booking)
    _commit_or_conflict(db)
    return booking


def availability_for(db: Session, items: list[ItemIn], location: str):
    plan = _plan(db, items, public=True)
    _check_location(db, location)
    return availability_service.public_slots(db, plan.minutes, location)


# ——— The client's own link ———


def _by_token(db: Session, token: str) -> Booking:
    booking = db.scalar(select(Booking).where(Booking.manage_token == token)) if token else None
    if booking is None:
        raise NotFoundError("This booking link is not valid.")
    return booking


def id_for_token(db: Session, token: str) -> uuid.UUID:
    return _by_token(db, token).id


def _deadline(db: Session, booking: Booking) -> datetime:
    hours = schedule_service.get_booking_settings(db).cancellation_notice_hours
    return booking.start_time - timedelta(hours=hours)


def _can_change(db: Session, booking: Booking) -> bool:
    return booking.status in ACTIVE_STATUSES and datetime.now(UTC) < _deadline(db, booking)


def managed(db: Session, token: str) -> ManagedBooking:
    expire_stale(db)
    booking = _by_token(db, token)
    rules = schedule_service.get_booking_settings(db)
    business = settings_service.get(db)
    policy = rules.policy_en if booking.locale == "en" and rules.policy_en else rules.policy_sq
    return ManagedBooking(
        reference=booking.reference,
        status=booking.status,
        date=to_local(booking.start_time).date(),
        start=_hhmm(booking.start_time),
        end=_hhmm(booking.end_time),
        items=[ItemOut.model_validate(item) for item in booking.items],
        location=booking.location,
        address=booking.address,
        customer_name=booking.customer_name,
        locale=booking.locale,
        can_change=_can_change(db, booking),
        change_deadline=_deadline(db, booking),
        policy=policy,
        business_name=business.business_name,
        business_phone=business.phone,
    )


def _changeable(db: Session, token: str, client: str) -> Booking:
    manage_limit.check(db, client)
    booking = _by_token(db, token)
    if not _can_change(db, booking):
        raise ConflictError("This booking can no longer be changed online. Please call or message.")
    return booking


def client_cancel(db: Session, token: str, client: str) -> ManagedBooking:
    booking = _changeable(db, token, client)
    booking.status = "cancelled"
    booking.cancelled_by = "client"
    booking.decided_at = datetime.now(UTC)
    db.commit()
    return managed(db, token)


def client_availability(db: Session, token: str):
    booking = _by_token(db, token)
    return availability_service.public_slots(
        db, _minutes(booking), booking.location, exclude_booking_id=booking.id
    )


def client_reschedule(db: Session, token: str, data: ClientReschedule, client: str) -> ManagedBooking:
    """A new time from the client: it goes back to Yllka to confirm."""
    booking = _changeable(db, token, client)
    _check_free(db, _minutes(booking), booking.location, data.date, data.time, booking.id)
    _place(db, booking, data.date, data.time, _minutes(booking))
    booking.status = "pending"
    booking.client_changed_at = datetime.now(UTC)
    booking.reminder_sent_at = None
    _commit_or_conflict(db)
    return managed(db, token)


# ——— Admin ———


def admin_create(db: Session, data: AdminBookingCreate) -> BookingOut:
    plan = _plan(db, data.items, public=False)
    minutes = data.duration_minutes or plan.minutes
    if not minutes:
        raise InvalidInputError("Please choose how long the appointment takes.")
    booking = Booking(
        reference=_new_reference(db),
        manage_token=secrets.token_urlsafe(24),
        status="confirmed",
        source="admin",
        location=data.location,
        address=data.address if data.location == "client" else None,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        customer_email=data.customer_email,
        customer_note=data.customer_note,
        locale=data.locale,
        decided_at=datetime.now(UTC),
        service_id=plan.first_service_id,
        service_name_sq=plan.summary_sq,
        service_name_en=plan.summary_en,
        price=plan.price,
        price_type=plan.price_type,
        items=plan.items,
    )
    _place(db, booking, data.date, data.time, minutes)
    db.add(booking)
    _commit_or_conflict(db)
    return _one(db, booking)


def get(db: Session, booking_id: uuid.UUID) -> BookingOut:
    expire_stale(db)
    return _one(db, _get(db, booking_id))


def change_status(db: Session, booking_id: uuid.UUID, change: StatusChange) -> BookingOut:
    booking = _get(db, booking_id)
    if change.status != booking.status and change.status not in TRANSITIONS[booking.status]:
        raise InvalidInputError(f"A {booking.status} booking can't become {change.status}.")
    booking.status = change.status
    booking.cancelled_by = "admin" if change.status == "cancelled" else None
    if change.message is not None:
        booking.admin_message = change.message
    booking.decided_at = datetime.now(UTC)
    _commit_or_conflict(db)
    return _one(db, booking)


def reschedule(db: Session, booking_id: uuid.UUID, data: Reschedule) -> BookingOut:
    booking = _get(db, booking_id)
    if booking.status not in ACTIVE_STATUSES:
        raise InvalidInputError("Only pending or confirmed bookings can be moved.")
    _place(db, booking, data.date, data.time, data.duration_minutes or _minutes(booking))
    booking.reminder_sent_at = None
    if data.message is not None:
        booking.admin_message = data.message
    _commit_or_conflict(db)
    return _one(db, booking)


def update_note(db: Session, booking_id: uuid.UUID, note: str | None) -> BookingOut:
    booking = _get(db, booking_id)
    booking.admin_note = note
    db.commit()
    return _one(db, booking)


def set_reminder(db: Session, booking_id: uuid.UUID, sent: bool) -> BookingOut:
    booking = _get(db, booking_id)
    booking.reminder_sent_at = datetime.now(UTC) if sent else None
    db.commit()
    return _one(db, booking)


def _day_bounds(day: date) -> tuple[datetime, datetime]:
    return local_datetime(day, time.min), local_datetime(day + timedelta(days=1), time.min)


def list_view(db: Session, view: View, now: datetime | None = None) -> list[BookingOut]:
    """Nearest first: upcoming soonest-first, past most-recent-first."""
    now = now or datetime.now(UTC)
    expire_stale(db, now)
    today = to_local(now).date()
    day_start, day_end = _day_bounds(today)
    query = select(Booking)
    match view:
        case "upcoming":
            query = query.where(Booking.status.in_(ACTIVE_STATUSES), Booking.end_time > now)
            query = query.order_by(Booking.start_time)
        case "pending":
            query = query.where(Booking.status == "pending").order_by(Booking.start_time)
        case "today":
            query = query.where(
                Booking.start_time >= day_start,
                Booking.start_time < day_end,
                Booking.status.not_in(("declined", "cancelled", "expired")),
            ).order_by(Booking.start_time)
        case "week":
            query = query.where(
                Booking.status.in_(ACTIVE_STATUSES),
                Booking.end_time > now,
                Booking.start_time < day_start + timedelta(days=7),
            ).order_by(Booking.start_time)
        case "past":
            query = query.where(
                Booking.end_time <= now,
                Booking.status.in_(("confirmed", "completed", "no_show")),
            ).order_by(Booking.start_time.desc())
        case "cancelled":
            query = query.where(
                Booking.status.in_(("declined", "cancelled", "expired"))
            ).order_by(Booking.start_time.desc())
        case "reminders":
            tomorrow_start, tomorrow_end = _day_bounds(today + timedelta(days=1))
            query = query.where(
                Booking.status == "confirmed",
                Booking.start_time >= tomorrow_start,
                Booking.start_time < tomorrow_end,
            ).order_by(Booking.start_time)
    return _outs(db, list(db.scalars(query.limit(300))))


def in_range(db: Session, first_day: date, last_day: date) -> list[BookingOut]:
    """Every booking starting on these days, for the calendar."""
    expire_stale(db)
    start, _ = _day_bounds(first_day)
    _, end = _day_bounds(last_day)
    query = (
        select(Booking)
        .where(Booking.start_time >= start, Booking.start_time < end)
        .order_by(Booking.start_time)
    )
    return _outs(db, list(db.scalars(query)))


def summary(db: Session, now: datetime | None = None) -> BookingSummary:
    now = now or datetime.now(UTC)
    upcoming = list_view(db, "upcoming", now)
    today = to_local(now).date()
    return BookingSummary(
        pending=sum(1 for b in upcoming if b.status == "pending"),
        today=sum(1 for b in upcoming if b.date == today),
        upcoming=len(upcoming),
        conflicts=sum(1 for b in upcoming if b.conflicts),
        reminders=sum(1 for b in list_view(db, "reminders", now) if b.reminder_sent_at is None),
    )

