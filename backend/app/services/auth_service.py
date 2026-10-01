from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.exceptions import ConflictError
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


def change_email(db: Session, admin: Admin, email: str) -> Admin:
    email = normalize_email(email)
    taken = db.scalar(select(Admin).where(Admin.email == email, Admin.id != admin.id))
    if taken is not None:
        raise ConflictError("That email is already used by another account.")
    admin.email = email
    db.commit()
    return admin


def change_password(db: Session, admin: Admin, new_password: str, keep_token: str) -> None:
    """Sets a new password and signs out every other device."""
    admin.password_hash = hash_password(new_password)
    db.execute(
        delete(AdminSession).where(
            AdminSession.admin_id == admin.id,
            AdminSession.token_hash != hash_session_token(keep_token),
        )
    )
    db.commit()


def revoke_session(db: Session, token: str) -> None:
    db.execute(
        delete(AdminSession).where(AdminSession.token_hash == hash_session_token(token))
    )
    db.commit()
