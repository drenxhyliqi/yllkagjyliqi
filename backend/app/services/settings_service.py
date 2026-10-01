"""Business contact details."""

from sqlalchemy.orm import Session

from app.models import BusinessSettings
from app.schemas.settings import (
    BusinessIn,
    PublicAddress,
    PublicBusiness,
    PublicHours,
    PublicInstagram,
    PublicLink,
)
from app.services import schedule_service


def get(db: Session) -> BusinessSettings:
    settings = db.get(BusinessSettings, 1)
    if settings is None:
        settings = BusinessSettings(id=1, business_name="Yllka")
        db.add(settings)
        db.commit()
    return settings


def update(db: Session, data: BusinessIn) -> BusinessSettings:
    settings = get(db)
    for field, value in data.model_dump().items():
        setattr(settings, field, value)
    db.commit()
    return settings


def public(db: Session) -> PublicBusiness:
    settings = get(db)
    hhmm = lambda t: t.strftime("%H:%M") if t else None  # noqa: E731
    return PublicBusiness(
        name=settings.business_name,
        phone=settings.phone,
        email=settings.email,
        instagram=PublicInstagram(
            handle=settings.instagram, url=f"https://www.instagram.com/{settings.instagram}/"
        )
        if settings.instagram
        else None,
        facebook=PublicLink(url=settings.facebook_url) if settings.facebook_url else None,
        address=PublicAddress(street=settings.street, city=settings.city or "")
        if settings.street
        else None,
        maps_url=settings.maps_url,
        hours=[
            PublicHours(
                weekday=day.weekday,
                opens=hhmm(day.opens_at) if day.is_open else None,
                closes=hhmm(day.closes_at) if day.is_open else None,
            )
            for day in schedule_service.get_hours(db)
        ],
    )
