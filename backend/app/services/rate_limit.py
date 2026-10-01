"""Rate limits stored in PostgreSQL, so they survive restarts and deploys."""

import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.models import RateLimitEvent


class TooManyRequests(Exception):
    """A rate limit was reached."""


class RateLimit:
    """At most `limit` events per key within `window_seconds`."""

    def __init__(self, scope: str, limit: int, window_seconds: int) -> None:
        self.scope = scope
        self.limit = limit
        self.window = timedelta(seconds=window_seconds)

    def retry_after(self, db: Session, key: str) -> int | None:
        """Seconds until another attempt is allowed, or None if allowed now."""
        now = datetime.now(UTC)
        count, oldest = db.execute(
            select(func.count(), func.min(RateLimitEvent.created_at)).where(
                RateLimitEvent.scope == self.scope,
                RateLimitEvent.key == key[:200],
                RateLimitEvent.created_at > now - self.window,
            )
        ).one()
        if count < self.limit:
            return None
        return max(1, int((oldest + self.window - now).total_seconds()))

    def hit(self, db: Session, key: str) -> None:
        db.add(RateLimitEvent(scope=self.scope, key=key[:200]))
        # Now and then, drop events far too old to matter.
        if random.random() < 0.05:
            db.execute(
                delete(RateLimitEvent).where(
                    RateLimitEvent.created_at < datetime.now(UTC) - timedelta(days=1)
                )
            )
        db.commit()

    def check(self, db: Session, key: str) -> None:
        """Counts this attempt, or raises TooManyRequests when over the limit."""
        if self.retry_after(db, key) is not None:
            raise TooManyRequests
        self.hit(db, key)

    def reset(self, db: Session, key: str) -> None:
        db.execute(
            delete(RateLimitEvent).where(
                RateLimitEvent.scope == self.scope, RateLimitEvent.key == key[:200]
            )
        )
        db.commit()


# Failed sign-ins (and wrong current passwords) per email or account.
login_limit = RateLimit("login", limit=5, window_seconds=15 * 60)
# Booking requests per visitor.
booking_limit = RateLimit("booking", limit=10, window_seconds=60 * 60)
# Changes through a client's private link, per visitor.
manage_limit = RateLimit("manage", limit=20, window_seconds=60 * 60)
# "Forgot password" emails per address and per visitor.
password_reset_limit = RateLimit("password_reset", limit=5, window_seconds=60 * 60)
