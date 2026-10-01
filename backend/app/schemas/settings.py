import re
from typing import Annotated

from pydantic import AfterValidator, BaseModel, BeforeValidator, ConfigDict, HttpUrl, TypeAdapter

from app.schemas.common import OptionalText, Text

_INSTAGRAM_NAME = re.compile(r"^[A-Za-z0-9._]{1,30}$")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PHONE = re.compile(r"^\+?[0-9 ()\-]{6,25}$")


def _instagram_name(value: object) -> object:
    """Accepts "yllka", "@yllka" or a profile link; keeps the username."""
    if not isinstance(value, str):
        return value
    value = value.strip()
    match = re.search(r"instagram\.com/([^/?#]+)", value)
    if match:
        value = match.group(1)
    value = value.lstrip("@")
    if not value:
        return None
    if not _INSTAGRAM_NAME.match(value):
        raise ValueError("That doesn't look like an Instagram username.")
    return value


_http_url = TypeAdapter(HttpUrl)


def _web_link(value: object) -> object:
    """Checks a web address, adding https:// when someone types just "facebook.com/…"."""
    if not isinstance(value, str):
        return value
    value = value.strip()
    if not value:
        return None
    if not re.match(r"^https?://", value, re.IGNORECASE):
        value = f"https://{value}"
    if len(value) > 1000:
        raise ValueError("That link is too long.")
    return str(_http_url.validate_python(value))


def _matches(pattern: re.Pattern[str], message: str):
    def check(value: str | None) -> str | None:
        if value is not None and not pattern.match(value):
            raise ValueError(message)
        return value

    return check


WebLink = Annotated[str | None, BeforeValidator(_web_link)]


class BusinessIn(BaseModel):
    business_name: Text(80)
    phone: Annotated[OptionalText(40), AfterValidator(_matches(_PHONE, "Please check the phone number."))] = None
    email: Annotated[OptionalText(254), AfterValidator(_matches(_EMAIL, "Please check the email address."))] = None
    street: OptionalText(120) = None
    city: OptionalText(80) = None
    maps_url: WebLink = None
    instagram: Annotated[str | None, BeforeValidator(_instagram_name)] = None
    facebook_url: WebLink = None


class BusinessOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    business_name: str
    phone: str | None
    email: str | None
    street: str | None
    city: str | None
    maps_url: str | None
    instagram: str | None
    facebook_url: str | None


class PublicHours(BaseModel):
    weekday: int
    opens: str | None
    closes: str | None


class PublicInstagram(BaseModel):
    handle: str
    url: str


class PublicLink(BaseModel):
    url: str


class PublicAddress(BaseModel):
    street: str
    city: str


class PublicBusiness(BaseModel):
    """The shape the website's footer and contact page use."""

    name: str
    phone: str | None
    email: str | None
    instagram: PublicInstagram | None
    facebook: PublicLink | None
    address: PublicAddress | None
    maps_url: str | None
    hours: list[PublicHours]
