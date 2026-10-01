import uuid
from decimal import Decimal
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.common import Euros, OptionalText, Text

PriceType = Literal["fixed", "from", "on_request"]


class ServiceIn(BaseModel):
    category_id: uuid.UUID
    name_sq: Text(100)
    name_en: OptionalText(100) = None
    description_sq: OptionalText(500) = None
    description_en: OptionalText(500) = None
    price: Annotated[Decimal, Field(ge=0, le=100_000, decimal_places=2)] | None = None
    price_type: PriceType = "fixed"
    # From 5 minutes to 12 hours.
    duration_minutes: Annotated[int, Field(ge=5, le=720)] | None = None
    is_active: bool = True

    @model_validator(mode="after")
    def price_matches_type(self) -> "ServiceIn":
        if self.price_type == "on_request":
            self.price = None
        elif self.price is None:
            raise ValueError("Please enter a price, or choose “on request”.")
        return self


class ServiceAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category_id: uuid.UUID
    slug: str
    name_sq: str
    name_en: str | None
    description_sq: str | None
    description_en: str | None
    price: Euros | None
    price_type: PriceType
    duration_minutes: int | None
    is_active: bool


class PublicService(BaseModel):
    id: uuid.UUID
    slug: str
    name: str
    description: str | None
    price: Euros | None
    price_type: PriceType
    duration_minutes: int | None
