import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.cli import ensure_admin
from app.core.security import verify_password
from app.models import Admin


@pytest.fixture
def initial(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("INITIAL_ADMIN_EMAIL", "First@Example.test")
    monkeypatch.setenv("INITIAL_ADMIN_PASSWORD", "first-password-123")


def test_creates_the_first_admin_once(db: Session, initial) -> None:
    assert ensure_admin() == "Created the first admin first@example.test."
    admin = db.scalar(select(Admin))
    assert admin.name == "Yllka" and verify_password(admin.password_hash, "first-password-123")

    # Every later start leaves the account alone, even with other values.
    admin.email = "changed@example.test"
    db.commit()
    assert "already exists" in ensure_admin()
    assert db.scalar(select(func.count()).select_from(Admin)) == 1
    assert db.scalar(select(Admin.email)) == "changed@example.test"


def test_does_nothing_without_variables(db: Session, monkeypatch) -> None:
    monkeypatch.delenv("INITIAL_ADMIN_EMAIL", raising=False)
    monkeypatch.delenv("INITIAL_ADMIN_PASSWORD", raising=False)
    assert "nothing to do" in ensure_admin()
    assert db.scalar(select(func.count()).select_from(Admin)) == 0


def test_refuses_a_short_password(db: Session, initial, monkeypatch) -> None:
    monkeypatch.setenv("INITIAL_ADMIN_PASSWORD", "short")
    assert "not used" in ensure_admin()
    assert db.scalar(select(func.count()).select_from(Admin)) == 0
