import re

from fastapi.testclient import TestClient

from tests.test_emails import outbox  # noqa: F401  (fixture)


def _link_token(email: dict) -> str:
    return re.search(r"/admin/reset-password/([A-Za-z0-9_-]+)", email["text"]).group(1)


def test_reset_flow(client: TestClient, admin_headers: dict, outbox) -> None:  # noqa: F811
    response = client.post("/api/auth/password-reset", json={"email": "Owner@Example.test"})
    assert response.status_code == 202
    (email,) = outbox
    assert email["to"] == ["owner@example.test"]
    token = _link_token(email)

    short = client.post("/api/auth/password-reset/confirm", json={"token": token, "new_password": "short"})
    assert short.status_code == 422
    done = client.post("/api/auth/password-reset/confirm", json={"token": token, "new_password": "brand-new-password"})
    assert done.status_code == 204

    # Every device is signed out, the new password works, the link works once.
    assert client.get("/api/auth/me", headers=admin_headers).status_code == 401
    assert client.post("/api/auth/login", json={"email": "owner@example.test", "password": "brand-new-password"}).status_code == 200
    again = client.post("/api/auth/password-reset/confirm", json={"token": token, "new_password": "another-password"})
    assert again.status_code == 422


def test_unknown_email_gets_the_same_answer(client: TestClient, admin_headers: dict, outbox) -> None:  # noqa: F811
    known = client.post("/api/auth/password-reset", json={"email": "owner@example.test"})
    unknown = client.post("/api/auth/password-reset", json={"email": "nobody@example.test"})
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
    assert len(outbox) == 1


def test_reset_emails_are_limited(client: TestClient, admin_headers: dict, outbox) -> None:  # noqa: F811
    for _ in range(8):
        client.post("/api/auth/password-reset", json={"email": "owner@example.test"})
    assert len(outbox) == 5


def test_only_the_newest_link_works(client: TestClient, admin_headers: dict, outbox) -> None:  # noqa: F811
    client.post("/api/auth/password-reset", json={"email": "owner@example.test"})
    client.post("/api/auth/password-reset", json={"email": "owner@example.test"})
    first, second = (_link_token(email) for email in outbox)
    assert client.post("/api/auth/password-reset/confirm", json={"token": first, "new_password": "brand-new-password"}).status_code == 422
    assert client.post("/api/auth/password-reset/confirm", json={"token": second, "new_password": "brand-new-password"}).status_code == 204
