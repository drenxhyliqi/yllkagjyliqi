from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import Admin, AdminSession

EMAIL = "yllka@example.test"
PASSWORD = "correct horse battery"


@pytest.fixture
def admin(db: Session) -> Admin:
    admin = Admin(email=EMAIL, name="Yllka", password_hash=hash_password(PASSWORD))
    db.add(admin)
    db.commit()
    return admin


def login(client: TestClient, email: str = EMAIL, password: str = PASSWORD):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_login_me_logout_flow(client: TestClient, admin: Admin) -> None:
    response = login(client)
    assert response.status_code == 200
    body = response.json()
    assert body["admin"] == {"id": str(admin.id), "email": EMAIL, "name": "Yllka"}
    token = body["token"]

    me = client.get("/api/auth/me", headers=auth(token))
    assert me.status_code == 200
    assert me.json()["email"] == EMAIL

    assert client.post("/api/auth/logout", headers=auth(token)).status_code == 204
    assert client.get("/api/auth/me", headers=auth(token)).status_code == 401


def test_session_token_is_stored_hashed(client: TestClient, admin: Admin, db: Session) -> None:
    token = login(client).json()["token"]
    stored = db.scalar(select(AdminSession.token_hash))
    assert stored is not None and stored != token


def test_email_is_case_insensitive(client: TestClient, admin: Admin) -> None:
    assert login(client, email="  YLLKA@Example.test ").status_code == 200


@pytest.mark.parametrize(
    ("email", "password"),
    [(EMAIL, "wrong password"), ("nobody@example.test", PASSWORD)],
)
def test_bad_credentials_get_the_same_message(
    client: TestClient, admin: Admin, email: str, password: str
) -> None:
    response = login(client, email=email, password=password)
    assert response.status_code == 401
    assert response.json() == {"message": "Email or password is incorrect."}


def test_inactive_admin_cannot_sign_in(client: TestClient, admin: Admin, db: Session) -> None:
    db.execute(update(Admin).values(is_active=False))
    db.commit()
    assert login(client).status_code == 401


def test_repeated_failures_are_throttled(client: TestClient, admin: Admin) -> None:
    for _ in range(5):
        assert login(client, password="wrong password").status_code == 401

    response = login(client)  # even the right password waits
    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) > 0


def test_expired_session_is_rejected(client: TestClient, admin: Admin, db: Session) -> None:
    token = login(client).json()["token"]
    db.execute(update(AdminSession).values(expires_at=datetime.now(UTC) - timedelta(minutes=1)))
    db.commit()

    response = client.get("/api/auth/me", headers=auth(token))
    assert response.status_code == 401
    assert "expired" in response.json()["message"]


def test_me_requires_a_token(client: TestClient) -> None:
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json() == {"message": "Please sign in."}


def test_validation_errors_use_the_message_format(client: TestClient) -> None:
    response = client.post("/api/auth/login", json={"email": EMAIL})
    assert response.status_code == 422
    assert response.json()["message"].startswith("password:")
