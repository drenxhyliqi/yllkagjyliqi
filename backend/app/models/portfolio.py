import uuid

from sqlalchemy import ForeignKey, String, false, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.category import Category
from app.models.media import MediaAsset
from app.models.mixins import TimestampMixin


class PortfolioItem(TimestampMixin, Base):
    """One piece of work in the gallery: a look, with one or more photos."""

    __tablename__ = "portfolio_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    title_sq: Mapped[str] = mapped_column(String(120))
    title_en: Mapped[str | None] = mapped_column(String(120))
    description_sq: Mapped[str | None] = mapped_column(String(1000))
    description_en: Mapped[str | None] = mapped_column(String(1000))
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), index=True
    )
    is_featured: Mapped[bool] = mapped_column(default=False, server_default=false())
    is_published: Mapped[bool] = mapped_column(default=True, server_default=true())
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")

    category: Mapped[Category | None] = relationship(lazy="joined")
    images: Mapped[list["PortfolioImage"]] = relationship(
        back_populates="item",
        order_by="PortfolioImage.sort_order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class PortfolioImage(Base):
    """A photo of a portfolio item. The first one is the cover."""

    __tablename__ = "portfolio_images"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("portfolio_items.id", ondelete="CASCADE"), index=True
    )
    media_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("media_assets.id", ondelete="RESTRICT"), unique=True
    )
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")

    item: Mapped[PortfolioItem] = relationship(back_populates="images")
    media: Mapped[MediaAsset] = relationship(lazy="joined")
