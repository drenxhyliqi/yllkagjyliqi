from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BusinessSettings(Base):
    """Contact details shown on the website. A single row (id = 1)."""

    __tablename__ = "business_settings"
    __table_args__ = (CheckConstraint("id = 1", name="single_row"),)

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    business_name: Mapped[str] = mapped_column(String(80), default="Yllka")
    phone: Mapped[str | None] = mapped_column(String(40))
    email: Mapped[str | None] = mapped_column(String(254))
    street: Mapped[str | None] = mapped_column(String(120))
    city: Mapped[str | None] = mapped_column(String(80))
    maps_url: Mapped[str | None] = mapped_column(String(1000))
    # Username only, without "@"; the profile URL is derived from it.
    instagram: Mapped[str | None] = mapped_column(String(30))
    facebook_url: Mapped[str | None] = mapped_column(String(300))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
