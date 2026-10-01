import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.common import MediaOut, OptionalText, PublicImage, Text


class PortfolioIn(BaseModel):
    title_sq: Text(120)
    title_en: OptionalText(120) = None
    description_sq: OptionalText(1000) = None
    description_en: OptionalText(1000) = None
    category_id: uuid.UUID | None = None
    # Uploaded photos in display order; the first is the cover.
    image_ids: list[uuid.UUID] = Field(min_length=1, max_length=20)
    is_featured: bool = False
    is_published: bool = True

    @field_validator("image_ids")
    @classmethod
    def no_duplicates(cls, ids: list[uuid.UUID]) -> list[uuid.UUID]:
        if len(set(ids)) != len(ids):
            raise ValueError("The same photo is listed twice.")
        return ids


class PortfolioAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title_sq: str
    title_en: str | None
    description_sq: str | None
    description_en: str | None
    category_id: uuid.UUID | None
    images: list[MediaOut]
    is_featured: bool
    is_published: bool
    created_at: datetime


class PublicCategoryRef(BaseModel):
    slug: str
    name: str


class PublicPortfolioItem(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str | None
    category: PublicCategoryRef | None
    is_featured: bool
    images: list[PublicImage]
