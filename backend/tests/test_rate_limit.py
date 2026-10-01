import pytest
from sqlalchemy.orm import Session

from app.services.rate_limit import RateLimit, TooManyRequests


def test_limit_survives_a_restart(db: Session) -> None:
    before = RateLimit("test", limit=2, window_seconds=60)
    before.check(db, "visitor")
    before.check(db, "visitor")

    # A new process (or a restart) sees the same attempts.
    after = RateLimit("test", limit=2, window_seconds=60)
    with pytest.raises(TooManyRequests):
        after.check(db, "visitor")
    assert after.retry_after(db, "visitor") is not None
    assert after.retry_after(db, "someone else") is None

    after.reset(db, "visitor")
    after.check(db, "visitor")
