import uuid

from sqlalchemy import ForeignKey, String, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.media import MediaAsset
from app.models.mixins import TimestampMixin


class Category(TimestampMixin, Base):
    """A group of services, e.g. Hair or Bridal. Also groups portfolio work."""

    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Set once from the name and kept, so links keep working after a rename.
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    # Albanian is required; English falls back to it when empty.
    name_sq: Mapped[str] = mapped_column(String(80))
    name_en: Mapped[str | None] = mapped_column(String(80))
    description_sq: Mapped[str | None] = mapped_column(String(300))
    description_en: Mapped[str | None] = mapped_column(String(300))
    image_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("media_assets.id", ondelete="SET NULL")
    )
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")

    image: Mapped[MediaAsset | None] = relationship(lazy="joined")
    services: Mapped[list["Service"]] = relationship(  # noqa: F821
        back_populates="category", order_by="Service.sort_order"
    )
