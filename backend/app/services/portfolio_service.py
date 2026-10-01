"""Portfolio work and its photos."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidInputError, NotFoundError
from app.models import Category, PortfolioImage, PortfolioItem
from app.schemas.common import MediaOut
from app.schemas.portfolio import (
    PortfolioAdminOut,
    PortfolioIn,
    PublicCategoryRef,
    PublicPortfolioItem,
)
from app.services import media_service
from app.services.localize import Locale, pick, pick_optional, public_image
from app.utils.slugs import unique_slug


def _get(db: Session, item_id: uuid.UUID) -> PortfolioItem:
    item = db.get(PortfolioItem, item_id)
    if item is None:
        raise NotFoundError("That work no longer exists.")
    return item


def _check_category(db: Session, category_id: uuid.UUID | None) -> None:
    if category_id is not None and db.get(Category, category_id) is None:
        raise InvalidInputError("That category no longer exists.")


def _set_images(db: Session, item: PortfolioItem, image_ids: list[uuid.UUID]) -> None:
    assets = media_service.get_many(db, image_ids)
    in_use_elsewhere = db.scalar(
        select(func.count()).where(
            PortfolioImage.media_id.in_(image_ids),
            PortfolioImage.item_id != item.id,
        )
    )
    if in_use_elsewhere:
        raise InvalidInputError("One of the photos already belongs to other work.")

    keep = set(image_ids)
    removed = [image.media for image in item.images if image.media_id not in keep]
    current = {image.media_id: image for image in item.images}
    item.images = [
        current.get(asset.id) or PortfolioImage(media=asset) for asset in assets
    ]
    for position, image in enumerate(item.images):
        image.sort_order = position
    db.flush()
    for asset in removed:
        media_service.release(db, asset)


def _admin_out(item: PortfolioItem) -> PortfolioAdminOut:
    return PortfolioAdminOut.model_validate(
        {
            **{field: getattr(item, field) for field in PortfolioAdminOut.model_fields if field != "images"},
            "images": [MediaOut.model_validate(image.media) for image in item.images],
        }
    )


# ——— Admin ———


def admin_list(db: Session) -> list[PortfolioAdminOut]:
    items = db.scalars(select(PortfolioItem).order_by(PortfolioItem.sort_order)).unique()
    return [_admin_out(item) for item in items]


def admin_get(db: Session, item_id: uuid.UUID) -> PortfolioAdminOut:
    return _admin_out(_get(db, item_id))


def create(db: Session, data: PortfolioIn) -> PortfolioAdminOut:
    _check_category(db, data.category_id)
    first = db.scalar(select(func.min(PortfolioItem.sort_order)))
    item = PortfolioItem(
        slug=unique_slug(db, PortfolioItem.slug, data.title_en or data.title_sq),
        # New work goes to the top of the gallery.
        sort_order=(first or 0) - 1,
        **data.model_dump(exclude={"image_ids"}),
    )
    db.add(item)
    db.flush()
    _set_images(db, item, data.image_ids)
    db.commit()
    return _admin_out(item)


def update(db: Session, item_id: uuid.UUID, data: PortfolioIn) -> PortfolioAdminOut:
    item = _get(db, item_id)
    _check_category(db, data.category_id)
    for field, value in data.model_dump(exclude={"image_ids"}).items():
        setattr(item, field, value)
    _set_images(db, item, data.image_ids)
    db.commit()
    return _admin_out(item)


def delete(db: Session, item_id: uuid.UUID) -> None:
    item = _get(db, item_id)
    assets = [image.media for image in item.images]
    db.delete(item)
    db.flush()
    for asset in assets:
        media_service.release(db, asset)
    db.commit()


def reorder(db: Session, ids: list[uuid.UUID]) -> None:
    items = {item.id: item for item in db.scalars(select(PortfolioItem)).unique()}
    if set(ids) != set(items) or len(ids) != len(items):
        raise InvalidInputError("The list has changed in the meantime. Please reload and try again.")
    for position, item_id in enumerate(ids):
        items[item_id].sort_order = position
    db.commit()


# ——— Public ———


def _public(item: PortfolioItem, locale: Locale) -> PublicPortfolioItem:
    title = pick(item.title_sq, item.title_en, locale)
    return PublicPortfolioItem(
        id=item.id,
        slug=item.slug,
        title=title,
        description=pick_optional(item.description_sq, item.description_en, locale),
        category=PublicCategoryRef(
            slug=item.category.slug, name=pick(item.category.name_sq, item.category.name_en, locale)
        )
        if item.category
        else None,
        is_featured=item.is_featured,
        images=[public_image(image.media, title) for image in item.images],
    )


def public_list(db: Session, locale: Locale) -> list[PublicPortfolioItem]:
    items = db.scalars(
        select(PortfolioItem)
        .where(PortfolioItem.is_published)
        .order_by(PortfolioItem.sort_order)
    ).unique()
    return [_public(item, locale) for item in items if item.images]


def public_get(db: Session, slug: str, locale: Locale) -> PublicPortfolioItem:
    item = db.scalar(
        select(PortfolioItem).where(PortfolioItem.slug == slug, PortfolioItem.is_published)
    )
    if item is None or not item.images:
        raise NotFoundError("This work could not be found.")
    return _public(item, locale)
