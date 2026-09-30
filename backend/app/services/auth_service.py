import threading
import time
from collections import defaultdict, deque
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.security import (
    hash_password,
    hash_session_token,
    new_session_token,
    password_needs_rehash,
    simulate_password_check,
    verify_password,
)
from app.models import Admin, AdminSession


def normalize_email(email: str) -> str:
    return email.strip().lower()


def authenticate(db: Session, email: str, password: str) -> Admin | None:
    admin = db.scalar(select(Admin).where(Admin.email == normalize_email(email)))
    if admin is None or not admin.is_active:
        simulate_password_check(password)
        return None
    if not verify_password(admin.password_hash, password):
        return None
    if password_needs_rehash(admin.password_hash):
        admin.password_hash = hash_password(password)
    return admin


def create_session(db: Session, admin: Admin) -> tuple[str, AdminSession]:
    """Starts a session and returns the raw token (only its hash is stored)."""
    now = datetime.now(UTC)
    token = new_session_token()
    session = AdminSession(
        admin=admin,
        token_hash=hash_session_token(token),
        expires_at=now + timedelta(days=get_settings().session_days),
    )
    admin.last_login_at = now
    db.add(session)
    # Housekeeping: drop this admin's expired sessions.
    db.execute(
        delete(AdminSession).where(
            AdminSession.admin_id == admin.id, AdminSession.expires_at <= now
        )
    )
    db.commit()
    return token, session


def get_admin_by_token(db: Session, token: str) -> Admin | None:
    session = db.scalar(
        select(AdminSession)
        .options(joinedload(AdminSession.admin))
        .where(
            AdminSession.token_hash == hash_session_token(token),
            AdminSession.expires_at > datetime.now(UTC),
        )
    )
    if session is None or not session.admin.is_active:
        return None
    return session.admin


def revoke_session(db: Session, token: str) -> None:
    db.execute(
        delete(AdminSession).where(AdminSession.token_hash == hash_session_token(token))
    )
    db.commit()


class LoginThrottle:
    """
    Limits failed sign-ins per email address.

    In-memory, so limits reset on restart and are per process. That is enough
    for a single-admin site running one API process.
    """

    def __init__(self, max_failures: int = 5, window_seconds: int = 15 * 60) -> None:
        self.max_failures = max_failures
        self.window_seconds = window_seconds
        self._failures: defaultdict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def retry_after(self, key: str) -> int | None:
        """Seconds until another attempt is allowed, or None if allowed now."""
        with self._lock:
            failures = self._prune(key)
            if len(failures) < self.max_failures:
                return None
            return max(1, int(failures[0] + self.window_seconds - time.monotonic()))

    def record_failure(self, key: str) -> None:
        with self._lock:
            self._prune(key).append(time.monotonic())

    def reset(self, key: str) -> None:
        with self._lock:
            self._failures.pop(key, None)

    def _prune(self, key: str) -> deque[float]:
        failures = self._failures[key]
        cutoff = time.monotonic() - self.window_seconds
        while failures and failures[0] <= cutoff:
            failures.popleft()
        return failures


login_throttle = LoginThrottle()
