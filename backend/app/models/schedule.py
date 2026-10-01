import uuid
from datetime import date, datetime, time

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    SmallInteger,
    String,
    Time,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BusinessHours(Base):
    """Regular opening hours for one weekday (1 = Monday … 7 = Sunday)."""

    __tablename__ = "business_hours"
    __table_args__ = (
        CheckConstraint("weekday BETWEEN 1 AND 7", name="weekday_range"),
        CheckConstraint(
            "NOT is_open OR (opens_at IS NOT NULL AND closes_at IS NOT NULL"
            " AND opens_at < closes_at)",
            name="open_day_has_hours",
        ),
        # A break is both times or neither, and sits inside opening hours.
        CheckConstraint(
            "(break_starts_at IS NULL) = (break_ends_at IS NULL)", name="break_complete"
        ),
        CheckConstraint(
            "break_starts_at IS NULL OR (break_starts_at < break_ends_at"
            " AND break_starts_at >= opens_at AND break_ends_at <= closes_at)",
            name="break_within_hours",
        ),
    )

    weekday: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=False)
    is_open: Mapped[bool]
    # Local business time (BUSINESS_TIMEZONE), without a date.
    opens_at: Mapped[time | None] = mapped_column(Time)
    closes_at: Mapped[time | None] = mapped_column(Time)
    # Optional daily break, e.g. lunch 12:00–13:00: nothing can be booked across it.
    break_starts_at: Mapped[time | None] = mapped_column(Time)
    break_ends_at: Mapped[time | None] = mapped_column(Time)


class BlockedPeriod(Base):
    """Days when no appointments can be booked: holidays, time off, events."""

    __tablename__ = "blocked_periods"
    __table_args__ = (CheckConstraint("starts_on <= ends_on", name="ordered_dates"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    starts_on: Mapped[date] = mapped_column(Date, index=True)
    ends_on: Mapped[date] = mapped_column(Date)
    note: Mapped[str | None] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class BookingSettings(Base):
    """How appointments are offered. A single row (id = 1)."""

    __tablename__ = "booking_settings"
    __table_args__ = (
        CheckConstraint("id = 1", name="single_row"),
        CheckConstraint("slot_interval_minutes > 0", name="positive_interval"),
        CheckConstraint("min_notice_minutes >= 0", name="non_negative_notice"),
        CheckConstraint("booking_window_days > 0", name="positive_window"),
        CheckConstraint("buffer_minutes >= 0", name="non_negative_buffer"),
        CheckConstraint("travel_minutes >= 0", name="non_negative_travel"),
        CheckConstraint("cancellation_notice_hours >= 0", name="non_negative_cancellation"),
    )

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, default=1)
    # Appointments can start every N minutes within opening hours.
    slot_interval_minutes: Mapped[int] = mapped_column(SmallInteger)
    # Shortest notice for a booking, e.g. 120 = at least two hours ahead.
    min_notice_minutes: Mapped[int]
    # How far ahead customers can book.
    booking_window_days: Mapped[int] = mapped_column(SmallInteger)
    # Free time kept after every appointment to clean up and prepare.
    buffer_minutes: Mapped[int] = mapped_column(SmallInteger, default=0, server_default="0")

    # Appointments at the client's place (home, venue).
    home_visits: Mapped[bool] = mapped_column(default=False, server_default="false")
    # Travel time blocked before and after an appointment at the client's place.
    travel_minutes: Mapped[int] = mapped_column(SmallInteger, default=30, server_default="30")
    # Shown to clients choosing a visit, e.g. "+20 € within Prishtina".
    home_visit_note_sq: Mapped[str | None] = mapped_column(String(300))
    home_visit_note_en: Mapped[str | None] = mapped_column(String(300))

    # Clients can cancel or change online until this many hours before.
    cancellation_notice_hours: Mapped[int] = mapped_column(
        SmallInteger, default=24, server_default="24"
    )
    # Shown before a client sends a request.
    policy_sq: Mapped[str | None] = mapped_column(String(1000))
    policy_en: Mapped[str | None] = mapped_column(String(1000))

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
