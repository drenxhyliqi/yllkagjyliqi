import uuid
from datetime import date, datetime, time
from zoneinfo import ZoneInfo

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import BlockedPeriod, BookingSettings, BusinessHours
from app.schemas.schedule import (
    BookingSettingsUpdate,
    DayOffCreate,
    HoursUpdate,
)

# Used the first time the schedule is read, until the admin changes it.
DEFAULT_HOURS = {
    1: (time(9), time(18)),
    2: (time(9), time(18)),
    3: (time(9), time(18)),
    4: (time(9), time(18)),
    5: (time(9), time(18)),
    6: (time(9), time(16)),
    7: None,
}
DEFAULT_SETTINGS = {
    "slot_interval_minutes": 30,
    "min_notice_minutes": 120,
    "booking_window_days": 60,
    "buffer_minutes": 0,
    "home_visits": False,
    "travel_minutes": 30,
    "cancellation_notice_hours": 24,
}


def business_today() -> date:
    return datetime.now(ZoneInfo(get_settings().business_timezone)).date()


def get_hours(db: Session) -> list[BusinessHours]:
    hours = list(db.scalars(select(BusinessHours).order_by(BusinessHours.weekday)))
    if len(hours) == 7:
        return hours
    existing = {day.weekday for day in hours}
    for weekday, span in DEFAULT_HOURS.items():
        if weekday not in existing:
            db.add(
                BusinessHours(
                    weekday=weekday,
                    is_open=span is not None,
                    opens_at=span[0] if span else None,
                    closes_at=span[1] if span else None,
                )
            )
    db.commit()
    return list(db.scalars(select(BusinessHours).order_by(BusinessHours.weekday)))


def update_hours(db: Session, update: HoursUpdate) -> list[BusinessHours]:
    current = {day.weekday: day for day in get_hours(db)}
    for day in update.days:
        row = current[day.weekday]
        row.is_open = day.is_open
        row.opens_at = day.opens_at
        row.closes_at = day.closes_at
        row.break_starts_at = day.break_starts_at
        row.break_ends_at = day.break_ends_at
    db.commit()
    return get_hours(db)


def get_booking_settings(db: Session) -> BookingSettings:
    settings = db.get(BookingSettings, 1)
    if settings is None:
        settings = BookingSettings(id=1, **DEFAULT_SETTINGS)
        db.add(settings)
        db.commit()
    return settings


def update_booking_settings(db: Session, update: BookingSettingsUpdate) -> BookingSettings:
    settings = get_booking_settings(db)
    for field, value in update.model_dump().items():
        setattr(settings, field, value)
    db.commit()
    return settings


def upcoming_days_off(db: Session) -> list[BlockedPeriod]:
    """Periods that have not ended yet, soonest first."""
    return list(
        db.scalars(
            select(BlockedPeriod)
            .where(BlockedPeriod.ends_on >= business_today())
            .order_by(BlockedPeriod.starts_on)
        )
    )


def add_day_off(db: Session, data: DayOffCreate) -> BlockedPeriod:
    period = BlockedPeriod(starts_on=data.starts_on, ends_on=data.ends_on, note=data.note)
    db.add(period)
    db.commit()
    return period


def remove_day_off(db: Session, period_id: uuid.UUID) -> bool:
    result = db.execute(delete(BlockedPeriod).where(BlockedPeriod.id == period_id))
    db.commit()
    return result.rowcount > 0
