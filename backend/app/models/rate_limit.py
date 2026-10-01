from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RateLimitEvent(Base):
    """
    One attempt counted by a rate limit (a failed sign-in, a booking request…).
    Kept in the database so limits survive restarts and hold across processes.
    """

    __tablename__ = "rate_limit_events"
    __table_args__ = (Index("ix_rate_limit_events_lookup", "scope", "key", "created_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    scope: Mapped[str] = mapped_column(String(30))
    # What is limited: an email, a visitor's address…
    key: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
