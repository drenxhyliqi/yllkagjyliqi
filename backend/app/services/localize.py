from typing import Literal

from app.models import MediaAsset
from app.schemas.common import PublicImage

Locale = Literal["sq", "en"]


def pick(sq: str, en: str | None, locale: Locale) -> str:
    """English when asked for and filled in; Albanian otherwise."""
    return en if locale == "en" and en else sq


def pick_optional(sq: str | None, en: str | None, locale: Locale) -> str | None:
    return en if locale == "en" and en else sq


def public_image(asset: MediaAsset, alt: str) -> PublicImage:
    return PublicImage(src=asset.url, alt=alt, width=asset.width, height=asset.height)
