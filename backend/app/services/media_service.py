import uuid
from collections.abc import Iterable
from datetime import UTC, datetime, timedelta

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.core.exceptions import InvalidInputError
from app.integrations.storage import image_provider
from app.models import Category, MediaAsset, PortfolioImage

# Photos uploaded but never saved with anything are removed after this long.
UNUSED_GRACE = timedelta(days=1)


def upload(db: Session, data: bytes) -> MediaAsset:
    """Stores a photo (raises InvalidImage) and records it."""
    stored = image_provider.save(data)
    asset = MediaAsset(
        storage=stored.storage,
        key=stored.key,
        url=stored.url,
        width=stored.width,
        height=stored.height,
    )
    db.add(asset)
    db.commit()
    remove_unused(db)
    return asset


def get_many(db: Session, ids: Iterable[uuid.UUID]) -> list[MediaAsset]:
    """The assets for `ids`, in the same order. Unknown ids are an input error."""
    ids = list(ids)
    found = {asset.id: asset for asset in db.scalars(select(MediaAsset).where(MediaAsset.id.in_(ids)))}
    if len(found) != len(set(ids)):
        raise InvalidInputError("One of the photos could not be found. Please upload it again.")
    return [found[media_id] for media_id in ids]


def release(db: Session, asset: MediaAsset) -> None:
    """Deletes an asset and its file. The caller commits."""
    if asset.key:
        image_provider.delete(asset.storage, asset.key)
    db.delete(asset)


def remove_unused(db: Session) -> None:
    """Clears uploads that were never attached to a category or portfolio item."""
    cutoff = datetime.now(UTC) - UNUSED_GRACE
    unused = db.scalars(
        select(MediaAsset).where(
            MediaAsset.created_at < cutoff,
            ~exists().where(Category.image_id == MediaAsset.id),
            ~exists().where(PortfolioImage.media_id == MediaAsset.id),
        )
    )
    for asset in unused:
        release(db, asset)
    db.commit()
