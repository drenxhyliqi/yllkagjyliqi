import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MediaAsset(Base):
    """An uploaded (or linked) image. The file itself lives in image storage, never here."""

    __tablename__ = "media_assets"
    __table_args__ = (
        CheckConstraint("storage IN ('local', 'cloudinary', 'external')", name="storage"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # "local": a file in MEDIA_ROOT, named `key`. "cloudinary": `key` is the
    # Cloudinary public id. "external": just a URL (demo seed data).
    storage: Mapped[str] = mapped_column(String(20))
    key: Mapped[str | None] = mapped_column(String(255), unique=True)
    url: Mapped[str] = mapped_column(String(1000))
    width: Mapped[int]
    height: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
