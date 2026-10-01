import uuid
from datetime import date, time
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator, model_validator

Weekday = Annotated[int, Field(ge=1, le=7)]


class DayHours(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    weekday: Weekday
    is_open: bool
    opens_at: time | None = None
    closes_at: time | None = None
    break_starts_at: time | None = None
    break_ends_at: time | None = None

    @model_validator(mode="after")
    def check_hours(self) -> "DayHours":
        if not self.is_open:
            # A closed day keeps no hours and no break.
            self.opens_at = self.closes_at = None
            self.break_starts_at = self.break_ends_at = None
            return self
        if self.opens_at is None or self.closes_at is None:
            raise ValueError("An open day needs an opening and a closing time.")
        if self.opens_at >= self.closes_at:
            raise ValueError("Closing time must be after opening time.")
        if (self.break_starts_at is None) != (self.break_ends_at is None):
            raise ValueError("A break needs a start and an end time.")
        if self.break_starts_at is not None:
            if self.break_starts_at >= self.break_ends_at:
                raise ValueError("The break must end after it starts.")
            if self.break_starts_at < self.opens_at or self.break_ends_at > self.closes_at:
                raise ValueError("The break must be within opening hours.")
        return self


class HoursUpdate(BaseModel):
    days: list[DayHours] = Field(min_length=7, max_length=7)

    @field_validator("days")
    @classmethod
    def one_per_weekday(cls, days: list[DayHours]) -> list[DayHours]:
        if sorted(day.weekday for day in days) != list(range(1, 8)):
            raise ValueError("Provide each weekday exactly once.")
        return sorted(days, key=lambda day: day.weekday)


SlotInterval = Literal[15, 20, 30, 45, 60]


class BookingSettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slot_interval_minutes: int
    min_notice_minutes: int
    booking_window_days: int
    buffer_minutes: int
    home_visits: bool
    travel_minutes: int
    home_visit_note_sq: str | None
    home_visit_note_en: str | None
    cancellation_notice_hours: int
    policy_sq: str | None
    policy_en: str | None


Note = Annotated[str, StringConstraints(strip_whitespace=True, max_length=300)] | None
Policy = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)] | None


class BookingSettingsUpdate(BaseModel):
    slot_interval_minutes: SlotInterval
    # Up to one week of notice.
    min_notice_minutes: Annotated[int, Field(ge=0, le=7 * 24 * 60)]
    # From one week to one year ahead.
    booking_window_days: Annotated[int, Field(ge=7, le=365)]
    buffer_minutes: Annotated[int, Field(ge=0, le=120)] = 0
    home_visits: bool = False
    travel_minutes: Annotated[int, Field(ge=0, le=240)] = 30
    home_visit_note_sq: Note = None
    home_visit_note_en: Note = None
    # Up to two weeks.
    cancellation_notice_hours: Annotated[int, Field(ge=0, le=336)] = 24
    policy_sq: Policy = None
    policy_en: Policy = None

    @model_validator(mode="after")
    def blank_to_none(self) -> "BookingSettingsUpdate":
        for field in ("home_visit_note_sq", "home_visit_note_en", "policy_sq", "policy_en"):
            if getattr(self, field) == "":
                setattr(self, field, None)
        return self


class DayOffCreate(BaseModel):
    starts_on: date
    # Leave empty for a single day.
    ends_on: date | None = None
    note: Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)] | None = None

    @model_validator(mode="after")
    def check_range(self) -> "DayOffCreate":
        if self.ends_on is None:
            self.ends_on = self.starts_on
        if self.ends_on < self.starts_on:
            raise ValueError("The end date must be on or after the start date.")
        if (self.ends_on - self.starts_on).days > 366:
            raise ValueError("A period off can be at most one year long.")
        if self.note == "":
            self.note = None
        return self


class DayOffOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    starts_on: date
    ends_on: date
    note: str | None


class ScheduleOut(BaseModel):
    """Everything the admin's Terminet page and the public booking page need."""

    timezone: str
    hours: list[DayHours]
    settings: BookingSettingsOut
    days_off: list[DayOffOut]
