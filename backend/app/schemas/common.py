import uuid
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, PlainSerializer, StringConstraints


def _blank_to_none(value: object) -> object:
    if isinstance(value, str):
        value = value.strip()
        return value or None
    return value


def Text(max_length: int) -> type[str]:  # noqa: N802 (reads like a type)
    """Required text, trimmed."""
    return Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=max_length)]  # type: ignore[return-value]


def OptionalText(max_length: int) -> type[str | None]:  # noqa: N802
    """Optional text; empty or blank becomes None."""
    return Annotated[  # type: ignore[return-value]
        Annotated[str, StringConstraints(max_length=max_length)] | None,
        BeforeValidator(_blank_to_none),
    ]


# Decimal in the database, plain number in JSON.
Euros = Annotated[Decimal, PlainSerializer(float, return_type=float)]


class ReorderIn(BaseModel):
    """Every id in the new order, first to last."""

    ids: list[uuid.UUID] = Field(min_length=1, max_length=500)


class MediaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    width: int
    height: int


class PublicImage(BaseModel):
    src: str
    alt: str
    width: int
    height: int
