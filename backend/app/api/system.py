from fastapi import APIRouter
from pydantic import BaseModel

from app.api.deps import CurrentAdmin
from app.core.config import get_settings
from app.services.notification_service import emails_enabled

router = APIRouter(prefix="/admin/system", tags=["admin: system"])


class SystemStatus(BaseModel):
    # Whether booking emails actually go out (Resend configured).
    emails: bool
    images: str


@router.get("")
def system_status(_: CurrentAdmin) -> SystemStatus:
    return SystemStatus(emails=emails_enabled(), images=get_settings().image_provider)
