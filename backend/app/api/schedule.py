import uuid

from fastapi import APIRouter, HTTPException, Response, status

from app.api.deps import CurrentAdmin, DbSession
from app.core.config import get_settings
from app.schemas.schedule import (
    BookingSettingsOut,
    BookingSettingsUpdate,
    DayHours,
    DayOffCreate,
    DayOffOut,
    HoursUpdate,
    ScheduleOut,
)
from app.services import schedule_service
from app.services.schedule_service import business_today

public_router = APIRouter(tags=["schedule"])
admin_router = APIRouter(prefix="/admin/schedule", tags=["admin: schedule"])


def _schedule(db: DbSession) -> ScheduleOut:
    return ScheduleOut(
        timezone=get_settings().business_timezone,
        hours=[DayHours.model_validate(day) for day in schedule_service.get_hours(db)],
        settings=BookingSettingsOut.model_validate(schedule_service.get_booking_settings(db)),
        days_off=[DayOffOut.model_validate(p) for p in schedule_service.upcoming_days_off(db)],
    )


@public_router.get("/schedule")
def public_schedule(db: DbSession) -> ScheduleOut:
    """Opening hours, booking rules and upcoming days off, for the booking page."""
    return _schedule(db)


@admin_router.get("")
def admin_schedule(_: CurrentAdmin, db: DbSession) -> ScheduleOut:
    return _schedule(db)


@admin_router.put("/hours")
def update_hours(update: HoursUpdate, _: CurrentAdmin, db: DbSession) -> list[DayHours]:
    return [DayHours.model_validate(day) for day in schedule_service.update_hours(db, update)]


@admin_router.put("/settings")
def update_settings(
    update: BookingSettingsUpdate, _: CurrentAdmin, db: DbSession
) -> BookingSettingsOut:
    return BookingSettingsOut.model_validate(schedule_service.update_booking_settings(db, update))


@admin_router.post("/days-off", status_code=status.HTTP_201_CREATED)
def add_day_off(data: DayOffCreate, _: CurrentAdmin, db: DbSession) -> DayOffOut:
    if data.starts_on < business_today():
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Days off can't start in the past.")
    return DayOffOut.model_validate(schedule_service.add_day_off(db, data))


@admin_router.delete("/days-off/{period_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_day_off(period_id: uuid.UUID, _: CurrentAdmin, db: DbSession) -> Response:
    if not schedule_service.remove_day_off(db, period_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That day off no longer exists.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
