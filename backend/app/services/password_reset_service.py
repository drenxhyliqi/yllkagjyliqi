"""'Forgot password': a one-time link by email, valid for an hour."""

import secrets
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import InvalidInputError
from app.core.security import hash_password, hash_session_token
from app.models import Admin, AdminPasswordReset, AdminSession
from app.services import settings_service
from app.services.auth_service import normalize_email
from app.services.email_templates import Content, Email, render

LINK_LIFETIME = timedelta(hours=1)


def start(db: Session, email: str) -> Email | None:
    """A reset email for this address, or None when no active admin has it."""
    admin = db.scalar(select(Admin).where(Admin.email == normalize_email(email), Admin.is_active))
    if admin is None:
        return None
    token = secrets.token_urlsafe(32)
    # One link at a time: a new request replaces older ones.
    db.execute(delete(AdminPasswordReset).where(AdminPasswordReset.admin_id == admin.id))
    db.add(
        AdminPasswordReset(
            admin_id=admin.id,
            token_hash=hash_session_token(token),
            expires_at=datetime.now(UTC) + LINK_LIFETIME,
        )
    )
    db.commit()

    link = f"{get_settings().site_url.rstrip('/')}/admin/reset-password/{token}"
    business = settings_service.get(db).business_name
    html, text = render(
        business,
        Content(
            heading="Vendosni një fjalëkalim të ri",
            paragraphs=[
                "Dikush kërkoi të ndryshojë fjalëkalimin e panelit tuaj. Lidhja vlen një orë.",
                "Nëse nuk e kërkuat ju, injorojeni këtë email: fjalëkalimi nuk ndryshon.",
            ],
            details=[],
            button=("Vendos fjalëkalimin e ri", link),
        ),
    )
    return Email(to=admin.email, subject=f"{business}: fjalëkalimi i ri", html=html, text=text)


def finish(db: Session, token: str, new_password: str) -> None:
    reset = db.scalar(
        select(AdminPasswordReset).where(
            AdminPasswordReset.token_hash == hash_session_token(token),
            AdminPasswordReset.used_at.is_(None),
            AdminPasswordReset.expires_at > datetime.now(UTC),
        )
    )
    admin = db.get(Admin, reset.admin_id) if reset else None
    if reset is None or admin is None or not admin.is_active:
        raise InvalidInputError("This link is invalid or has expired. Please ask for a new one.")
    admin.password_hash = hash_password(new_password)
    reset.used_at = datetime.now(UTC)
    # Whoever knew the old password is signed out everywhere.
    db.execute(delete(AdminSession).where(AdminSession.admin_id == admin.id))
    db.commit()
