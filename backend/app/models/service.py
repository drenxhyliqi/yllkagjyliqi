import uuid
from decimal import Decimal

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.category import Category
from app.models.mixins import TimestampMixin

PRICE_TYPES = ("fixed", "from", "on_request")


class Service(TimestampMixin, Base):
    """Something a client can book, with its price and duration."""

    __tablename__ = "services"
    __table_args__ = (
        CheckConstraint(f"price_type IN {PRICE_TYPES}", name="price_type"),
        # "On request" shows no price; the other two always have one.
        CheckConstraint(
            "(price_type = 'on_request') = (price IS NULL)", name="price_matches_type"
        ),
        CheckConstraint("price IS NULL OR price >= 0", name="price_not_negative"),
        CheckConstraint(
            "duration_minutes IS NULL OR duration_minutes > 0", name="duration_positive"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Deleting a category with services is refused, never cascaded.
    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    slug: Mapped[str] = mapped_column(String(100), unique=True)
    name_sq: Mapped[str] = mapped_column(String(100))
    name_en: Mapped[str | None] = mapped_column(String(100))
    description_sq: Mapped[str | None] = mapped_column(String(500))
    description_en: Mapped[str | None] = mapped_column(String(500))
    # Euros.
    price: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    price_type: Mapped[str] = mapped_column(String(20), default="fixed")
    duration_minutes: Mapped[int | None]
    is_active: Mapped[bool] = mapped_column(default=True, server_default=true())
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")

    category: Mapped[Category] = relationship(back_populates="services")
