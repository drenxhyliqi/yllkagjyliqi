import uuid

from pydantic import BaseModel, ConfigDict

from app.schemas.common import MediaOut, OptionalText, PublicImage, Text
from app.schemas.service import PublicService, ServiceAdminOut


class CategoryIn(BaseModel):
    name_sq: Text(80)
    name_en: OptionalText(80) = None
    description_sq: OptionalText(300) = None
    description_en: OptionalText(300) = None
    image_id: uuid.UUID | None = None
    is_active: bool = True


class CategoryAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name_sq: str
    name_en: str | None
    description_sq: str | None
    description_en: str | None
    image: MediaOut | None
    is_active: bool
    services: list[ServiceAdminOut]
    # Portfolio items in this category; deleting needs them moved first.
    work_count: int = 0


class PublicCategory(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str | None
    image: PublicImage | None


class PublicCategoryWithServices(PublicCategory):
    services: list[PublicService]
