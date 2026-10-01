from fastapi import APIRouter

from app.api.deps import CurrentAdmin, DbSession
from app.schemas.settings import BusinessIn, BusinessOut, PublicBusiness
from app.services import settings_service

public_router = APIRouter(tags=["business"])
admin_router = APIRouter(prefix="/admin/business", tags=["admin: settings"])


@public_router.get("/business")
def public_business(db: DbSession) -> PublicBusiness:
    """Contact details and opening hours for the footer and contact page."""
    return settings_service.public(db)


@admin_router.get("")
def get_business(_: CurrentAdmin, db: DbSession) -> BusinessOut:
    return BusinessOut.model_validate(settings_service.get(db))


@admin_router.put("")
def update_business(data: BusinessIn, _: CurrentAdmin, db: DbSession) -> BusinessOut:
    return BusinessOut.model_validate(settings_service.update(db, data))
