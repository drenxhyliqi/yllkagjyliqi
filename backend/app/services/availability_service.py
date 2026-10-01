"""
Which start times can be booked. The only place availability is calculated:

    opening hours − daily break − days off − confirmed bookings, stepped by
    the slot interval, where the whole service must fit before closing.

Each booking takes a "block" of Yllka's day: the appointment, plus travel
before and after a visit at the client's place, plus preparation time after
every appointment. Blocks of confirmed bookings can't overlap.

Requests that are still pending don't take a time: several people may ask
for the same hour, and Yllka decides in the admin.

The website additionally applies the minimum notice and the booking window.
"""

import uuid
from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import BlockedPeriod, Booking
from app.models.booking import HOLDING_STATUS
from app.services import schedule_service


def business_zone() -> ZoneInfo:
    return ZoneInfo(get_settings().business_timezone)


def to_local(moment: datetime) -> datetime:
    return moment.astimezone(business_zone())


def local_datetime(day: date, at) -> datetime:
    return datetime.combine(day, at, tzinfo=business_zone())


def public_window(db: Session, now: datetime | None = None) -> tuple[date, date]:
    """First and last day the website offers."""
    today = to_local(now or datetime.now(UTC)).date()
    rules = schedule_service.get_booking_settings(db)
    return today, today + timedelta(days=rules.booking_window_days)


Slots = dict[date, list[str]]
Reason = str  # "booked" | "break" | "notice"
Unavailable = dict[date, list[tuple[str, Reason]]]


def slots(
    db: Session,
    duration_minutes: int,
    first_day: date,
    last_day: date,
    *,
    before_minutes: int = 0,
    after_minutes: int = 0,
    now: datetime | None = None,
    min_notice_minutes: int = 0,
    exclude_booking_id: uuid.UUID | None = None,
) -> tuple[Slots, Unavailable]:
    """
    Start times per day, from first_day to last_day inclusive:
    (free, unavailable with the reason).

    Every start time of an open day is in one of the two, so the website can
    show the whole day. Times where the service wouldn't finish before
    closing aren't start times at all.
    """
    zone = business_zone()
    now = now or datetime.now(UTC)
    earliest = now + timedelta(minutes=min_notice_minutes)
    duration = timedelta(minutes=duration_minutes)
    before = timedelta(minutes=before_minutes)
    after = timedelta(minutes=after_minutes)
    step = timedelta(minutes=schedule_service.get_booking_settings(db).slot_interval_minutes)
    hours = {day.weekday: day for day in schedule_service.get_hours(db)}

    range_start = datetime.combine(first_day, datetime.min.time(), tzinfo=zone)
    range_end = datetime.combine(last_day + timedelta(days=1), datetime.min.time(), tzinfo=zone)

    days_off = list(
        db.scalars(
            select(BlockedPeriod).where(
                BlockedPeriod.starts_on <= last_day, BlockedPeriod.ends_on >= first_day
            )
        )
    )
    busy_query = select(Booking.block_start, Booking.block_end).where(
        Booking.status == HOLDING_STATUS,
        Booking.block_start < range_end + after,
        Booking.block_end > range_start - before,
    )
    if exclude_booking_id:
        busy_query = busy_query.where(Booking.id != exclude_booking_id)
    busy = db.execute(busy_query).all()

    free: Slots = {}
    unavailable: Unavailable = {}
    day = first_day
    while day <= last_day:
        opening = hours.get(day.isoweekday())
        is_off = any(period.starts_on <= day <= period.ends_on for period in days_off)
        if opening and opening.is_open and not is_off:
            # Travel to a visit has to fit after opening, and back before closing.
            start = datetime.combine(day, opening.opens_at, tzinfo=zone) + before
            closes = datetime.combine(day, opening.closes_at, tzinfo=zone)
            last_end = closes - (before if before_minutes else timedelta(0))
            pause = (
                (
                    datetime.combine(day, opening.break_starts_at, tzinfo=zone),
                    datetime.combine(day, opening.break_ends_at, tzinfo=zone),
                )
                if opening.break_starts_at
                else None
            )
            open_times: list[str] = []
            closed_times: list[tuple[str, Reason]] = []
            while start + duration <= last_end:
                end = start + duration
                block_start, block_end = start - before, end + after
                label = start.strftime("%H:%M")
                if any(b_start < block_end and b_end > block_start for b_start, b_end in busy):
                    closed_times.append((label, "booked"))
                elif pause and pause[0] < end and pause[1] > start:
                    closed_times.append((label, "break"))
                elif start < earliest:
                    closed_times.append((label, "notice"))
                else:
                    open_times.append(label)
                start += step
            if open_times:
                free[day] = open_times
            if closed_times:
                unavailable[day] = closed_times
        day += timedelta(days=1)
    return free, unavailable


def margins(db: Session, location: str) -> tuple[int, int]:
    """Minutes blocked (before, after) an appointment: travel and preparation."""
    rules = schedule_service.get_booking_settings(db)
    travel = rules.travel_minutes if location == "client" else 0
    return travel, travel + rules.buffer_minutes


def public_slots(
    db: Session,
    duration_minutes: int,
    location: str = "studio",
    now: datetime | None = None,
    exclude_booking_id: uuid.UUID | None = None,
) -> tuple[date, date, Slots, Unavailable]:
    """What the website offers: within the window, with notice."""
    first, last = public_window(db, now)
    rules = schedule_service.get_booking_settings(db)
    before, after = margins(db, location)
    free, unavailable = slots(
        db,
        duration_minutes,
        first,
        last,
        before_minutes=before,
        after_minutes=after,
        now=now,
        min_notice_minutes=rules.min_notice_minutes,
        exclude_booking_id=exclude_booking_id,
    )
    return first, last, free, unavailable
